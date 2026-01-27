"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, X, AlertCircle, Loader2, Zap, ScanLine } from "lucide-react"
import { useRouter } from "next/navigation"
// Importa a biblioteca Powerhouse
import QrScanner from 'qr-scanner';

type OrderDetail = {
    id: string
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
    const [scannedCount, setScannedCount] = useState(0) // Força re-render se necessário

    const supabase = createClient()
    const router = useRouter()

    // --- INICIALIZAÇÃO DO SCANNER ---
    useEffect(() => {
        if (cameraActive && videoRef.current && !scannerRef.current) {
            // Inicializa o Scanner com prioridade NATIVA
            const scanner = new QrScanner(
                videoRef.current,
                (result) => handleScan(result.data),
                {
                    // 🚀 O SEGREDO: On Scan Error (Ignora erros de quadros vazios)
                    onDecodeError: (error) => {
                        // Não faz nada, apenas continua tentando
                    },
                    // ⚡ Tenta usar a aceleração de hardware do celular
                    highlightScanRegion: true,
                    highlightCodeOutline: true,
                    // Prefere a câmera traseira
                    preferredCamera: 'environment',
                    // Tenta ler códigos invertidos (fundo preto) ou pequenos
                    maxScansPerSecond: 25,
                }
            );

            scanner.start().then(() => {
                console.log("Scanner iniciado com sucesso (Engine: Hybrid)");
            }).catch(err => console.error(err));

            scannerRef.current = scanner;
        }

        // Cleanup ao sair
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop();
                scannerRef.current.destroy();
                scannerRef.current = null;
            }
        }
    }, [cameraActive]);

    const handleScan = (text: string) => {
        // 🛡️ Filtros de Segurança
        if (!text.includes('-')) return; // Ignora lixo

        // Pausa o scanner imediatamente ao encontrar
        if (scannerRef.current) {
            scannerRef.current.stop();
            setCameraActive(false);
        }

        // Feedback Tátil
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(200);
        }

        fetchOrderDetails(text);
    }

    const fetchOrderDetails = async (rawId: string) => {
        setLoading(true)
        setError(null)

        let orderId = rawId
        if (rawId.includes('/')) {
            const parts = rawId.split('/')
            orderId = parts[parts.length - 1].split('?')[0]
        }

        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
          id, status, consumption_date,
          users ( email ),
          menu_items ( name, image_url )
        `)
                .eq('id', orderId)
                .single()

            if (error) throw error

            if (!data) {
                setError("Pedido não encontrado.")
            } else {
                setOrderData(data as any)
            }
        } catch (err) {
            console.error(err)
            setError("Erro ao processar ticket.")
        } finally {
            setLoading(false)
        }
    }

    const resetScan = () => {
        setOrderData(null)
        setError(null)
        setCameraActive(true)
        // Reinicia o scanner
        if (scannerRef.current) {
            scannerRef.current.start();
        }
    }

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">

            {/* 1. LAYER DE VÍDEO */}
            <div className="absolute inset-0 w-full h-full bg-black">
                {/* O qr-scanner precisa apenas desta tag video pura */}
                <video
                    ref={videoRef}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${cameraActive ? 'opacity-100' : 'opacity-20 blur-md'}`}
                    playsInline
                    muted
                />
            </div>

            {/* 2. INTERFACE (Overlay) */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20">
                <div className="flex flex-col text-white drop-shadow-md bg-black/40 px-3 py-1 rounded-lg backdrop-blur-md border border-white/10">
                    <span className="font-bold text-lg flex items-center gap-2">
                        <Zap className="fill-yellow-400 text-yellow-400 h-5 w-5" /> Native Engine
                    </span>
                </div>
                <Button
                    variant="ghost" size="icon" onClick={() => router.back()}
                    className="text-white bg-black/40 hover:bg-black/60 rounded-full h-10 w-10 backdrop-blur-md border border-white/10"
                >
                    <X />
                </Button>
            </div>

            {/* MIRA CENTRAL (Visual Guide) */}
            {cameraActive && !loading && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="w-72 h-72 rounded-3xl relative overflow-hidden border border-white/40 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]">
                        <div className="absolute inset-x-0 h-0.5 bg-red-500/50 top-1/2" />
                    </div>
                    <p className="absolute bottom-24 text-white/90 font-medium text-sm bg-black/60 px-6 py-3 rounded-full backdrop-blur-md border border-white/10">
                        Aponte para o Ticket
                    </p>
                </div>
            )}

            {/* 3. RESULTADOS */}
            {loading && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-2xl flex flex-col items-center gap-4 animate-in zoom-in">
                        <Loader2 className="h-10 w-10 text-green-600 animate-spin" />
                        <p className="font-bold text-slate-800">Processando...</p>
                    </div>
                </div>
            )}

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
                            </div>
                            <Button onClick={resetScan} className="w-full h-14 text-lg font-bold bg-slate-900 text-white rounded-xl">
                                Ler Próximo
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {error && (
                <div className="absolute bottom-0 left-0 right-0 p-6 z-40">
                    <Card className="w-full bg-red-50/95 backdrop-blur-xl border-2 border-red-200 shadow-2xl animate-in shake rounded-[2rem]">
                        <CardContent className="flex flex-col items-center p-8 gap-4 text-center">
                            <AlertCircle className="h-10 w-10 text-red-600" />
                            <p className="font-bold text-red-900">{error}</p>
                            <Button onClick={resetScan} variant="outline" className="w-full mt-2 border-red-200">
                                Tentar Novamente
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

        </div>
    )
}
