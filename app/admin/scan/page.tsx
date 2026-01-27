"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Webcam from "react-webcam"
import jsQR from "jsqr" // A SOLUÇÃO DETERMINÍSTICA
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, X, AlertCircle, Loader2, Zap, Keyboard } from "lucide-react"
import { useRouter } from "next/navigation"

type OrderDetail = {
    id: string
    short_id?: string
    status: string
    consumption_date: string
    users: { email: string }
    menu_items: { name: string; image_url: string }
}

export default function ScanPage() {
    const webcamRef = useRef<Webcam>(null)

    // States
    const [orderData, setOrderData] = useState<OrderDetail | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [manualCode, setManualCode] = useState("")
    const [showManualInput, setShowManualInput] = useState(false)
    const [cameraActive, setCameraActive] = useState(true)

    const supabase = createClient()
    const router = useRouter()

    // --- O CÉREBRO LOCAL (jsQR) ---
    const captureAndScan = useCallback(() => {
        // Se a câmera estiver desligada ou já estiver ocupado, não faz nada
        if (!webcamRef.current || !cameraActive || loading || orderData || showManualInput) return;

        const video = webcamRef.current.video;
        if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) return;

        // 1. Cria um canvas virtual para extrair os pixels do vídeo
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // 2. Desenha o frame atual
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // 3. Pega os dados brutos (ImageData)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // 4. Manda para o jsQR decodificar (Zero Alucinação)
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
        });

        if (code) {
            // achou algo!
            const scannedText = code.data.trim();
            console.log("⚡ QR Lido Localmente:", scannedText);

            if (scannedText.length >= 3) {
                setCameraActive(false); // Pausa visualmente
                if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(200);
                fetchOrderDetails(scannedText);
            }
        }
    }, [webcamRef, cameraActive, loading, orderData, showManualInput]);

    // Loop Infinito: Tenta ler a cada 300ms (Mais rápido que server-side)
    useEffect(() => {
        const interval = setInterval(() => {
            captureAndScan();
        }, 300);
        return () => clearInterval(interval);
    }, [captureAndScan]);


    const fetchOrderDetails = async (code: string) => {
        setLoading(true)
        setError(null)

        // Limpeza bruta do código lido
        let cleanCode = code.replace(/[^A-Z0-9-]/g, "");

        // Lógica Híbrida: Short ID vs UUID
        let query = supabase.from('orders').select(`
          id, short_id, status, consumption_date,
          users ( email ),
          menu_items ( name, image_url )
        `)

        if (cleanCode.length < 15) {
            query = query.eq('short_id', cleanCode)
        } else {
            const cleanId = cleanCode.includes('/') ? cleanCode.split('/').pop()?.split('?')[0] : cleanCode;
            query = query.eq('id', cleanId)
        }

        try {
            const { data, error } = await query.single()

            if (error || !data) {
                // Se der erro, mostra o que leu e religa a câmera após 3 segundos
                setError(`Lido: ${cleanCode}. Não encontrado.`)
                setTimeout(() => {
                    if (!orderData) {
                        setError(null);
                        setCameraActive(true);
                    }
                }, 3000);
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
        setCameraActive(true)
    }

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col text-sans">

            {/* 1. VÍDEO PURO */}
            <div className="absolute inset-0 w-full h-full bg-black">
                {cameraActive && (
                    <Webcam
                        ref={webcamRef}
                        audio={false}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{
                            facingMode: "environment", // Câmera traseira
                            width: 720,
                            height: 1280
                        }}
                        className="w-full h-full object-cover"
                    />
                )}
                {/* Camada escura se câmera off */}
                {!cameraActive && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 transition-all duration-300" />
                )}
            </div>

            {/* 2. HEADER FLUTUANTE */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20">
                <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white font-medium flex items-center gap-2 shadow-lg">
                    <Zap size={16} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-bold tracking-wide">SCANNER PRO</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="bg-black/40 text-white rounded-full hover:bg-black/60 border border-white/10 backdrop-blur-md h-10 w-10">
                    <X size={20} />
                </Button>
            </div>

            {/* 3. MIRA CLEAN */}
            {cameraActive && !showManualInput && !orderData && !error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">

                    {/* O quadrado de foco */}
                    <div className="w-72 h-72 rounded-[2rem] relative shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] overflow-hidden border-2 border-white/30">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-64 h-0.5 bg-red-500/50 shadow-[0_0_10px_rgba(255,0,0,0.8)] animate-pulse rounded-full" />
                        </div>
                    </div>

                    <p className="mt-8 text-white/90 font-medium text-xs uppercase tracking-widest bg-black/50 px-6 py-3 rounded-full backdrop-blur-md border border-white/5 shadow-lg">
                        Aponte para o QR Code
                    </p>
                </div>
            )}

            {/* 4. INPUT MANUAL (Fallback) */}
            {!orderData && !loading && !error && (
                <div className="absolute bottom-12 left-0 right-0 flex justify-center z-20 px-6">
                    {showManualInput ? (
                        <div className="bg-white p-2 pl-4 rounded-full w-full max-w-sm shadow-2xl flex gap-2 animate-in slide-in-from-bottom items-center">
                            <Input
                                autoFocus
                                placeholder="CÓDIGO"
                                className="text-lg uppercase tracking-widest font-mono font-bold border-0 focus-visible:ring-0 p-0 text-slate-900 h-10 placeholder:text-slate-300"
                                value={manualCode}
                                maxLength={6}
                                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                            />
                            <Button onClick={() => fetchOrderDetails(manualCode)} className="bg-slate-900 text-white rounded-full px-6 h-10 shrink-0 font-bold">OK</Button>
                            <Button variant="ghost" size="icon" onClick={() => setShowManualInput(false)} className="text-slate-400 shrink-0 h-10 w-10 rounded-full hover:bg-slate-100"><X size={18} /></Button>
                        </div>
                    ) : (
                        <Button
                            onClick={() => { setCameraActive(false); setShowManualInput(true); }}
                            className="bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-black/60 rounded-full px-8 h-14 gap-3 shadow-xl transition-all hover:scale-105 font-bold"
                        >
                            <Keyboard size={20} /> Digitar
                        </Button>
                    )}
                </div>
            )}

            {/* 5. MENSAGEM DE ERRO (Código não encontrado no banco) */}
            {error && (
                <div className="absolute bottom-0 left-0 right-0 p-6 z-40">
                    <Card className="w-full bg-red-50/90 backdrop-blur-xl border-2 border-red-200 shadow-2xl animate-in shake rounded-[2rem] overflow-hidden">
                        <CardContent className="flex flex-col items-center p-8 gap-4 text-center">
                            <AlertCircle className="h-8 w-8 text-red-600" />
                            <div>
                                <h3 className="text-xl font-bold text-red-900">Não Encontrado</h3>
                                <p className="text-red-700/80 mt-1 text-sm font-medium">{error}</p>
                            </div>
                            <Button onClick={() => { setError(null); setCameraActive(true); }} variant="outline" className="w-full mt-2 border-red-200 text-red-700 hover:bg-red-100 h-12 rounded-xl font-bold bg-white">
                                Tentar Novamente
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* 6. SUCESSO (Pedido Encontrado) */}
            {orderData && (
                <div className="absolute bottom-0 left-0 right-0 p-6 z-40">
                    <Card className="w-full bg-white/95 backdrop-blur-xl border-t-8 border-t-green-500 shadow-[0_-20px_60px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-full duration-500 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="text-center pb-2 pt-8">
                            <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-4" />
                            <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">Liberado!</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4 pb-8 px-8">
                            <div className="bg-slate-50 p-6 rounded-3xl text-center border border-slate-100 shadow-inner">
                                <h3 className="font-black text-2xl text-slate-900 leading-tight">{orderData.menu_items?.name}</h3>
                                <p className="text-base font-medium text-slate-500 mt-2">{orderData.users?.email}</p>
                                <p className="mt-4 text-sm font-mono font-bold text-slate-400 tracking-[0.2em]">{orderData.short_id}</p>
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
