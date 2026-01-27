"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, X, AlertCircle, Loader2, Zap, Keyboard } from "lucide-react"
import { useRouter } from "next/navigation"
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
    const [manualCode, setManualCode] = useState("") // Para digitação manual
    const [showManualInput, setShowManualInput] = useState(false)

    const supabase = createClient()
    const router = useRouter()

    // --- ENGINE DE LEITURA ---
    useEffect(() => {
        if (cameraActive && videoRef.current && !scannerRef.current) {
            const scanner = new QrScanner(
                videoRef.current,
                (result) => handleScan(result.data),
                {
                    onDecodeError: () => { },
                    highlightScanRegion: true,
                    highlightCodeOutline: true,
                    preferredCamera: 'environment',
                    maxScansPerSecond: 25,
                }
            );
            scanner.start().catch(console.error);
            scannerRef.current = scanner;
        }
        return () => {
            scannerRef.current?.stop();
            scannerRef.current?.destroy();
            scannerRef.current = null;
        }
    }, [cameraActive]);

    // Processa o código lido ou digitado
    const handleScan = (code: string) => {
        if (!code) return;

        // Para o scanner se estiver rodando
        if (scannerRef.current) {
            scannerRef.current.stop();
        }
        setCameraActive(false);

        // Feedback Vibratório
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(200);

        fetchOrderDetails(code);
    }

    const fetchOrderDetails = async (code: string) => {
        setLoading(true)
        setError(null)
        setOrderData(null) // Limpa dados anteriores

        let query = supabase.from('orders').select(`
          id, short_id, status, consumption_date,
          users ( email ),
          menu_items ( name, image_url )
        `)

        // LÓGICA HÍBRIDA:
        // Se o código for pequeno (ex: 6 chars), busca pelo short_id
        // Se for grande (UUID ou Link), busca pelo ID normal
        if (code.length < 10) {
            console.log("Buscando por Short ID:", code)
            query = query.eq('short_id', code.toUpperCase()) // Garante maiúsculo
        } else {
            // Limpa URL se houver
            const cleanId = code.includes('/') ? code.split('/').pop()?.split('?')[0] : code;
            query = query.eq('id', cleanId)
        }

        try {
            const { data, error } = await query.single()

            if (error || !data) {
                setError("Pedido não encontrado.")
                setCameraActive(false) // Mantém pausado para ver o erro
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
        scannerRef.current?.start();
    }

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">

            {/* 1. VÍDEO CAMERA */}
            <div className="absolute inset-0 w-full h-full bg-black">
                <video
                    ref={videoRef}
                    className={`w-full h-full object-cover transition-opacity ${cameraActive ? 'opacity-100' : 'opacity-30 blur-sm'}`}
                    playsInline muted
                />
            </div>

            {/* 2. INTERFACE DE TOPO */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20">
                <div className="bg-black/50 backdrop-blur px-3 py-1 rounded-full border border-white/10 text-white text-sm font-bold flex items-center gap-2">
                    <Zap size={14} className="text-yellow-400 fill-yellow-400" /> Scanner Rápido
                </div>
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="bg-black/40 text-white rounded-full"><X /></Button>
            </div>

            {/* 3. MIRA CENTRAL */}
            {cameraActive && !showManualInput && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                    <div className="w-64 h-64 border-2 border-white/60 rounded-3xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]">
                        <div className="absolute inset-x-4 top-1/2 h-0.5 bg-red-500/80 animate-pulse" />
                    </div>
                    <p className="mt-8 text-white/80 font-medium text-sm bg-black/40 px-4 py-2 rounded-full">
                        Aponte para o QR Code
                    </p>
                </div>
            )}

            {/* 4. BOTÃO DE DIGITAR (FALLBACK) */}
            {!orderData && !loading && (
                <div className="absolute bottom-10 left-0 right-0 flex justify-center z-20 px-6">
                    {showManualInput ? (
                        <div className="bg-white p-4 rounded-2xl w-full max-w-sm shadow-xl flex gap-2 animate-in slide-in-from-bottom">
                            <Input
                                autoFocus
                                placeholder="Digite o código (ex: 9A2B7C)"
                                className="text-lg uppercase tracking-widest font-mono font-bold"
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                            />
                            <Button onClick={() => handleScan(manualCode)} className="bg-slate-900 text-white">OK</Button>
                        </div>
                    ) : (
                        <Button
                            onClick={() => { setCameraActive(false); setShowManualInput(true); }}
                            className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 rounded-full px-6 h-12 gap-2"
                        >
                            <Keyboard size={18} /> Digitar Código
                        </Button>
                    )}
                </div>
            )}

            {/* 5. RESULTADOS (Mantidos do anterior) */}
            {/* ... (Use o mesmo bloco de Loading, Success Card e Error Card do código anterior) ... */}
            {/* Apenas certifique-se de que o botão "Tentar Novamente" no erro chame resetScan() */}

            {/* EXEMPLO DE CARD DE ERRO PARA COPIAR SE PRECISAR */}
            {error && (
                <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                    <Card className="w-full max-w-sm bg-red-50 border-red-200 shadow-2xl animate-in zoom-in">
                        <CardContent className="flex flex-col items-center p-6 gap-4 text-center">
                            <AlertCircle className="h-12 w-12 text-red-600" />
                            <h3 className="font-bold text-red-900 text-lg">{error}</h3>
                            <Button onClick={resetScan} className="w-full bg-red-100 text-red-800 hover:bg-red-200">Tentar Novamente</Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Card de Sucesso segue a mesma lógica... */}
            {orderData && (
                <div className="absolute bottom-0 left-0 right-0 p-6 z-40">
                    <Card className="w-full bg-white/95 backdrop-blur-xl border-t-8 border-t-green-500 shadow-2xl animate-in slide-in-from-bottom-full duration-300 rounded-[2rem]">
                        <CardHeader className="text-center pb-2">
                            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-2" />
                            <CardTitle className="text-2xl font-black text-slate-900">Validado!</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            <div className="bg-slate-50 p-4 rounded-2xl text-center">
                                <h3 className="font-bold text-xl text-slate-900">{orderData.menu_items?.name}</h3>
                                <p className="text-sm text-slate-500">{orderData.users?.email}</p>
                                {/* Mostra o Short ID Confirmado */}
                                <p className="mt-2 text-xs font-mono font-bold text-slate-400 tracking-widest">{orderData.short_id}</p>
                            </div>
                            <Button onClick={resetScan} className="w-full h-14 text-lg font-bold bg-slate-900 text-white rounded-xl">
                                Ler Próximo
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
