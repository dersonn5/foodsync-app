"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, X, AlertCircle, Loader2, Zap, Keyboard } from "lucide-react"
import { useRouter } from "next/navigation"
// Usando a biblioteca híbrida robusta
import QrScanner from 'qr-scanner';

type OrderDetail = {
    id: string
    short_id?: string
    status: string
    consumption_date: string
    users: { email: string }
    menu_items: { name: string; image_url: string }
}

export default function ScanPage() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const scannerRef = useRef<QrScanner | null>(null)

    const [orderData, setOrderData] = useState<OrderDetail | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [cameraActive, setCameraActive] = useState(true)
    const [manualCode, setManualCode] = useState("")
    const [showManualInput, setShowManualInput] = useState(false)

    const supabase = createClient()
    const router = useRouter()

    // --- ENGINE DE LEITURA (OTIMIZADA PARA 720p) ---
    useEffect(() => {
        // Só inicializa se a câmera estiver ativa e o elemento de vídeo existir
        if (cameraActive && videoRef.current && !scannerRef.current) {
            const scanner = new QrScanner(
                videoRef.current,
                (result) => handleScan(result.data),
                {
                    // Ignora erros de frames vazios para não poluir o console
                    onDecodeError: () => { },
                    // Tenta usar aceleração de hardware se disponível
                    highlightScanRegion: true,
                    // Prefere câmera traseira
                    preferredCamera: 'environment',
                    // Lê até 25 vezes por segundo (ótimo para 30fps de vídeo)
                    maxScansPerSecond: 25,
                    // 🚀 O SEGREDO DA FLUIDEZ: Forçar 720p (HD)
                    // Isso deixa o vídeo leve e o FPS alto, evitando travamentos.
                    constraints: {
                        video: {
                            height: { ideal: 720 }, // Prioriza 720p vertical
                            // width: { ideal: 1280 }, // Opcional para landscape
                            facingMode: 'environment'
                        }
                    }
                }
            );

            scanner.start().catch(err => {
                console.error("Erro ao iniciar câmera:", err);
                setError("Não foi possível acessar a câmera. Verifique as permissões.");
            });

            scannerRef.current = scanner;
        }

        // Limpeza ao sair da tela ou pausar a câmera
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop();
                scannerRef.current.destroy();
                scannerRef.current = null;
            }
        }
    }, [cameraActive]);

    const handleScan = (code: string) => {
        if (!code) return;
        // Filtro básico para ignorar leituras muito erradas
        if (code.length < 3) return;

        // Pausa o scanner imediatamente
        if (scannerRef.current) {
            scannerRef.current.stop();
        }
        setCameraActive(false);

        // Feedback Vibratório (se disponível)
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(200);
        }

        fetchOrderDetails(code.trim());
    }

    const fetchOrderDetails = async (code: string) => {
        setLoading(true)
        setError(null)
        setOrderData(null)

        let query = supabase.from('orders').select(`
          id, short_id, status, consumption_date,
          users ( email ),
          menu_items ( name, image_url )
        `)

        // LÓGICA HÍBRIDA (Suporta Short ID e UUID antigo)
        if (code.length < 10) {
            // É um Short ID (ex: A1B2C3)
            query = query.eq('short_id', code.toUpperCase())
        } else {
            // É um UUID ou URL (limpa se for URL)
            const cleanId = code.includes('/') ? code.split('/').pop()?.split('?')[0] : code;
            query = query.eq('id', cleanId)
        }

        try {
            const { data, error } = await query.single()

            if (error || !data) {
                setError("Pedido não encontrado. Verifique o código.")
                // Não religa a câmera automaticamente para o usuário ler o erro
            } else {
                setOrderData(data as any)
            }
        } catch (err) {
            setError("Erro de conexão ao validar o pedido.")
        } finally {
            setLoading(false)
        }
    }

    const resetScan = () => {
        setOrderData(null)
        setError(null)
        setManualCode("")
        setShowManualInput(false)
        setCameraActive(true) // Isso dispara o useEffect para religar a câmera
    }

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">

            {/* 1. VÍDEO CAMERA (Fundo total) */}
            <div className="absolute inset-0 w-full h-full bg-black">
                <video
                    ref={videoRef}
                    // Mantém um leve blur quando inativo para indicar pausa
                    className={`w-full h-full object-cover transition-opacity duration-300 ${cameraActive ? 'opacity-100' : 'opacity-40 blur-sm'}`}
                    playsInline
                    muted
                />
            </div>

            {/* 2. INTERFACE DE TOPO (Clean) */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20">
                <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white font-medium flex items-center gap-2 shadow-lg">
                    <Zap size={16} className="text-yellow-400 fill-yellow-400" /> Scanner Pro (720p)
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="bg-black/40 text-white rounded-full hover:bg-black/60 border border-white/10 backdrop-blur-md h-10 w-10"
                >
                    <X size={20} />
                </Button>
            </div>

            {/* 3. MIRA CENTRAL (Visual Limpo - Sem borda grossa, sem laser) */}
            {cameraActive && !showManualInput && !loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">

                    {/* O TRUQUE VISUAL: Uma caixa transparente.
               A sombra gigante (9999px) escurece tudo EM VOLTA dela.
               Não há border-2 nem linha vermelha dentro.
            */}
                    <div className="w-72 h-72 rounded-[2rem] relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] overflow-hidden">
                        {/* Área limpa para leitura */}
                    </div>

                    <p className="mt-8 text-white/90 font-medium text-sm bg-black/50 px-6 py-3 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
                        Centralize o QR Code
                    </p>
                </div>
            )}

            {/* 4. BOTÃO DE DIGITAR (Fallback essencial) */}
            {!orderData && !loading && !error && (
                <div className="absolute bottom-12 left-0 right-0 flex justify-center z-20 px-6">
                    {showManualInput ? (
                        // Campo de Input
                        <div className="bg-white p-3 pl-5 rounded-full w-full max-w-sm shadow-2xl flex gap-3 animate-in slide-in-from-bottom items-center">
                            <Input
                                autoFocus
                                placeholder="Ex: 9A2B7C"
                                className="text-xl uppercase tracking-[0.2em] font-mono font-bold border-0 focus-visible:ring-0 p-0 text-slate-900 h-auto placeholder:text-slate-300"
                                value={manualCode}
                                maxLength={6}
                                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                            />
                            <Button onClick={() => handleScan(manualCode)} className="bg-slate-900 text-white rounded-full px-6 h-10 shrink-0 font-bold">
                                OK
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setShowManualInput(false)} className="text-slate-400 shrink-0 h-10 w-10 rounded-full hover:bg-slate-100">
                                <X size={18} />
                            </Button>
                        </div>
                    ) : (
                        // Botão para abrir o input
                        <Button
                            onClick={() => { setCameraActive(false); setShowManualInput(true); }}
                            className="bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-black/60 rounded-full px-8 h-14 gap-3 shadow-xl transition-all hover:scale-105 font-bold"
                        >
                            <Keyboard size={20} /> Digitar Código Curto
                        </Button>
                    )}
                </div>
            )}

            {/* 5. FEEDBACK DE LOADING */}
            {loading && (
                <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
                        <Loader2 className="h-12 w-12 text-slate-900 animate-spin" />
                        <p className="font-bold text-lg text-slate-800">Validando...</p>
                    </div>
                </div>
            )}

            {/* 6. CARD DE ERRO */}
            {error && (
                <div className="absolute bottom-0 left-0 right-0 p-6 z-40">
                    <Card className="w-full bg-red-50/90 backdrop-blur-xl border-2 border-red-200 shadow-2xl animate-in shake rounded-[2rem] overflow-hidden">
                        <CardContent className="flex flex-col items-center p-8 gap-4 text-center">
                            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="h-8 w-8 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-red-900">Falha na Leitura</h3>
                                <p className="text-red-700/80 mt-2">{error}</p>
                            </div>
                            <Button onClick={resetScan} variant="outline" className="w-full mt-4 border-red-200 text-red-700 hover:bg-red-100 h-14 rounded-xl font-bold text-lg bg-white">
                                Tentar Novamente
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* 7. CARD DE SUCESSO (Ticket Validado) */}
            {orderData && (
                <div className="absolute bottom-0 left-0 right-0 p-6 z-40">
                    <Card className="w-full bg-white/95 backdrop-blur-xl border-t-8 border-t-green-500 shadow-[0_-20px_60px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-full duration-500 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="text-center pb-2 pt-8">
                            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <CheckCircle2 className="h-10 w-10 text-green-600" />
                            </div>
                            <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">Acesso Liberado!</CardTitle>
                            <p className="text-slate-500 font-medium uppercase tracking-widest text-xs mt-1">Ticket Validado com Sucesso</p>
                        </CardHeader>
                        <CardContent className="space-y-8 pt-6 pb-8 px-8">
                            <div className="bg-slate-50 p-6 rounded-3xl text-center border border-slate-100 shadow-inner">
                                {/* Foto do Prato (Se tiver) */}
                                {orderData.menu_items?.image_url && (
                                    <img src={orderData.menu_items.image_url} alt={orderData.menu_items.name} className="w-24 h-24 rounded-2xl mx-auto mb-4 object-cover shadow-md" />
                                )}
                                <h3 className="font-black text-2xl text-slate-900 leading-tight">{orderData.menu_items?.name}</h3>
                                <p className="text-base font-medium text-slate-500 mt-2">{orderData.users?.email}</p>

                                {/* Mostra o Short ID que foi lido */}
                                {orderData.short_id && (
                                    <div className="mt-4 inline-block bg-slate-200 px-4 py-1 rounded-full">
                                        <p className="text-sm font-mono font-bold text-slate-600 tracking-[0.2em]">{orderData.short_id}</p>
                                    </div>
                                )}
                            </div>

                            <Button onClick={resetScan} className="w-full h-16 text-xl font-bold bg-slate-900 text-white rounded-2xl shadow-xl hover:scale-[1.02] transition-transform active:scale-95">
                                Ler Próximo Pedido
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
