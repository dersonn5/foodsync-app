"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, X, AlertCircle, Loader2, Zap, Keyboard } from "lucide-react"
import { useRouter } from "next/navigation"
// Importa a classe Core (sem UI padrão)
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode"

type OrderDetail = {
    id: string
    short_id?: string
    status: string
    consumption_date: string
    users: { email: string }
    menu_items: { name: string; image_url: string }
}

export default function ScanPage() {
    const scannerRef = useRef<Html5Qrcode | null>(null)
    const regionId = "reader-stream-container" // ID único para a div do vídeo

    const [orderData, setOrderData] = useState<OrderDetail | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [cameraActive, setCameraActive] = useState(true)
    const [manualCode, setManualCode] = useState("")
    const [showManualInput, setShowManualInput] = useState(false)
    const [permissionError, setPermissionError] = useState(false)

    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        // Inicialização segura do Scanner
        if (cameraActive && !scannerRef.current && !orderData) {
            startScanner();
        }

        // Cleanup pesado ao sair
        return () => {
            stopScanner();
        }
    }, [cameraActive, orderData]);

    const startScanner = async () => {
        try {
            // Cria instância do scanner
            const html5QrCode = new Html5Qrcode(regionId);
            scannerRef.current = html5QrCode;

            // Configuração Técnica (O Segredo do ZXing)
            const config = {
                fps: 10, // 10 quadros por segundo é o ideal para web
                qrbox: { width: 250, height: 250 }, // Área de foco
                aspectRatio: 1.777778, // 16:9 (Tela cheia de celular)
                // 🚀 A MÁGICA: Tenta usar o hardware nativo do Android
                experimentalFeatures: {
                    useBarCodeDetectorIfSupported: true
                }
            };

            // Inicia a câmera (Traseira por padrão)
            await html5QrCode.start(
                { facingMode: "environment" },
                config,
                (decodedText) => {
                    handleScan(decodedText);
                },
                (errorMessage) => {
                    // Ignora erros de frame vazio (muito comum)
                }
            );

            // Tenta aplicar foco após iniciar (Hack para Android)
            applyCameraSettings(html5QrCode);

        } catch (err) {
            console.error("Erro ao iniciar câmera:", err);
            setPermissionError(true);
        }
    };

    const applyCameraSettings = (scanner: Html5Qrcode) => {
        // Tenta forçar foco e exposição
        try {
            // @ts-ignore - Método interno da lib para pegar a track de vídeo
            const videoTrack = scanner.getRunningTrackCameraCapabilities();
            if (videoTrack) {
                // Se suportado, aplica foco contínuo
                // Nota: Nem todos os browsers suportam aplicar constraints depois
            }
        } catch (e) { /* Silencia erros de capacidade */ }
    }

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop();
                }
                scannerRef.current.clear();
            } catch (e) {
                console.log("Scanner já estava parado");
            }
            scannerRef.current = null;
        }
    }

    const handleScan = (code: string) => {
        if (!code || code.length < 3) return;

        // Pausa visualmente (não para o scanner ainda para ser rápido na retomada se falhar)
        stopScanner();
        setCameraActive(false);

        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(200);

        fetchOrderDetails(code.trim());
    }

    const fetchOrderDetails = async (code: string) => {
        setLoading(true)
        setError(null)
        setOrderData(null)

        // Lógica Híbrida (Short ID vs UUID)
        let query = supabase.from('orders').select(`
          id, short_id, status, consumption_date,
          users ( email ),
          menu_items ( name, image_url )
        `)

        if (code.length < 10) {
            query = query.eq('short_id', code.toUpperCase())
        } else {
            const cleanId = code.includes('/') ? code.split('/').pop()?.split('?')[0] : code;
            query = query.eq('id', cleanId)
        }

        try {
            const { data, error } = await query.single()

            if (error || !data) {
                setError("Pedido não encontrado.")
            } else {
                setOrderData(data as any)
            }
        } catch (err) {
            setError("Erro de conexão.")
        } finally {
            setLoading(false)
        }
    }

    const resetScan = () => {
        setOrderData(null)
        setError(null)
        setManualCode("")
        setShowManualInput(false)
        setCameraActive(true) // Isso dispara o useEffect para religar
    }

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">

            {/* 1. VÍDEO (Container ID obrigatório para html5-qrcode) */}
            <div className="absolute inset-0 w-full h-full bg-black overflow-hidden">
                <div id={regionId} className="w-full h-full object-cover"></div>

                {/* Máscara de Pausa (Blur quando inativo) */}
                {!cameraActive && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10" />
                )}
            </div>

            {/* 2. INTERFACE SUPERIOR */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20 pointer-events-none">
                <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white font-medium flex items-center gap-2 shadow-lg">
                    <Zap size={16} className="text-yellow-400 fill-yellow-400" /> Native Engine
                </div>
                <Button
                    variant="ghost" size="icon" onClick={() => router.back()}
                    className="bg-black/40 text-white rounded-full hover:bg-black/60 border border-white/10 backdrop-blur-md h-10 w-10 pointer-events-auto"
                >
                    <X size={20} />
                </Button>
            </div>

            {/* 3. MIRA LIMPA (Design 10/10) */}
            {cameraActive && !showManualInput && !loading && !permissionError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                    {/* Caixa Transparente com Sombra Gigante (Efeito Foco) */}
                    <div className="w-72 h-72 rounded-[2.5rem] relative shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] overflow-hidden border border-white/20">
                        {/* Animação Sutil de Scan (Linha vertical transparente) */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent -translate-y-full animate-[shimmer_2s_infinite]"></div>
                    </div>
                    <p className="mt-8 text-white/90 font-medium text-sm bg-black/50 px-6 py-3 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
                        Aponte para o Short ID
                    </p>
                </div>
            )}

            {/* 4. MENSAGEM DE ERRO DE PERMISSÃO */}
            {permissionError && (
                <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-slate-900">
                    <div className="text-center text-white space-y-4">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                        <h3 className="text-xl font-bold">Câmera Bloqueada</h3>
                        <p className="text-slate-400">Verifique se você permitiu o acesso à câmera no navegador.</p>
                        <Button onClick={() => window.location.reload()} className="bg-white text-slate-900 font-bold">Recarregar Página</Button>
                    </div>
                </div>
            )}

            {/* 5. BOTÃO INPUT MANUAL */}
            {!orderData && !loading && !error && !permissionError && (
                <div className="absolute bottom-12 left-0 right-0 flex justify-center z-20 px-6 pointer-events-auto">
                    {showManualInput ? (
                        <div className="bg-white p-3 pl-5 rounded-full w-full max-w-sm shadow-2xl flex gap-3 animate-in slide-in-from-bottom items-center">
                            <Input
                                autoFocus
                                placeholder="Ex: A5BFC9"
                                className="text-xl uppercase tracking-[0.2em] font-mono font-bold border-0 focus-visible:ring-0 p-0 text-slate-900 h-auto placeholder:text-slate-300"
                                value={manualCode}
                                maxLength={6}
                                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                            />
                            <Button onClick={() => handleScan(manualCode)} className="bg-slate-900 text-white rounded-full px-6 h-10 shrink-0 font-bold">OK</Button>
                            <Button variant="ghost" size="icon" onClick={() => setShowManualInput(false)} className="text-slate-400 shrink-0 h-10 w-10 rounded-full hover:bg-slate-100"><X size={18} /></Button>
                        </div>
                    ) : (
                        <Button
                            onClick={() => { stopScanner(); setCameraActive(false); setShowManualInput(true); }}
                            className="bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-black/60 rounded-full px-8 h-14 gap-3 shadow-xl transition-all hover:scale-105 font-bold"
                        >
                            <Keyboard size={20} /> Digitar Código
                        </Button>
                    )}
                </div>
            )}

            {/* 6. LOADING / ERRO / SUCESSO */}

            {loading && (
                <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
                        <Loader2 className="h-12 w-12 text-slate-900 animate-spin" />
                        <p className="font-bold text-lg text-slate-800">Validando...</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute bottom-0 left-0 right-0 p-6 z-40">
                    <Card className="w-full bg-red-50/90 backdrop-blur-xl border-2 border-red-200 shadow-2xl animate-in shake rounded-[2rem] overflow-hidden">
                        <CardContent className="flex flex-col items-center p-8 gap-4 text-center">
                            <AlertCircle className="h-8 w-8 text-red-600" />
                            <div>
                                <h3 className="text-xl font-bold text-red-900">Falha</h3>
                                <p className="text-red-700/80 mt-2">{error}</p>
                            </div>
                            <Button onClick={resetScan} variant="outline" className="w-full mt-4 border-red-200 text-red-700 hover:bg-red-100 h-14 rounded-xl font-bold text-lg bg-white">Ler Outro</Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {orderData && (
                <div className="absolute bottom-0 left-0 right-0 p-6 z-40">
                    <Card className="w-full bg-white/95 backdrop-blur-xl border-t-8 border-t-green-500 shadow-[0_-20px_60px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-full duration-500 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="text-center pb-2 pt-8">
                            <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-4" />
                            <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">Liberado!</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8 pt-6 pb-8 px-8">
                            <div className="bg-slate-50 p-6 rounded-3xl text-center border border-slate-100 shadow-inner">
                                <h3 className="font-black text-2xl text-slate-900 leading-tight">{orderData.menu_items?.name}</h3>
                                <p className="text-base font-medium text-slate-500 mt-2">{orderData.users?.email}</p>
                                {orderData.short_id && (
                                    <div className="mt-4 inline-block bg-slate-200 px-4 py-1 rounded-full">
                                        <p className="text-sm font-mono font-bold text-slate-600 tracking-[0.2em]">{orderData.short_id}</p>
                                    </div>
                                )}
                            </div>
                            <Button onClick={resetScan} className="w-full h-16 text-xl font-bold bg-slate-900 text-white rounded-2xl shadow-xl hover:scale-[1.02] transition-transform active:scale-95">
                                Ler Próximo
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
