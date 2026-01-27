"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, X, AlertCircle, Loader2, Zap } from "lucide-react"
import { useRouter } from "next/navigation"
import { useZxing } from "react-zxing"

// Tipo do Pedido
type OrderDetail = {
    id: string
    status: string
    consumption_date: string
    users: { email: string }
    menu_items: { name: string; image_url: string }
}

export default function ScanPage() {
    const [result, setResult] = useState<string>("")
    const [orderData, setOrderData] = useState<OrderDetail | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [cameraActive, setCameraActive] = useState(true)

    const supabase = createClient()
    const router = useRouter()

    // --- CONFIGURAÇÃO DO MOTOR ZXING ---
    const { ref } = useZxing({
        paused: !cameraActive,
        onDecodeResult(decodedResult) {
            const text = decodedResult.getText()

            // 🛡️ Filtros de Lixo
            if (text === result) return // Ignora repetidos
            if (!text.includes('-')) return // Ignora se não for UUID (cód barras)

            // ✅ LEITURA BEM SUCEDIDA
            setResult(text)
            setCameraActive(false) // Trava a câmera

            // Feedback Vibratório (Se o celular suportar)
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(200);
            }

            fetchOrderDetails(text)
        },
        // ⚡ SUPER POTÊNCIA: Configurações de Câmera
        constraints: {
            video: {
                facingMode: "environment", // Câmera traseira
                width: { min: 1280, ideal: 1920 }, // Força HD/Full HD
                height: { min: 720, ideal: 1080 },
                // @ts-ignore - Propriedade avançada para focar em telas
                focusMode: "continuous"
            }
        },
        timeBetweenDecodingAttempts: 300,
    });

    const fetchOrderDetails = async (rawId: string) => {
        setLoading(true)
        setError(null)

        // Lógica de limpeza (caso seja URL)
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
        setResult("")
        setOrderData(null)
        setError(null)
        setCameraActive(true) // Destrava câmera
    }

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">

            {/* 1. LAYER DE VÍDEO (Fundo Total) */}
            <div className="absolute inset-0 w-full h-full bg-black">
                <video
                    ref={ref}
                    className={`w-full h-full object-cover ${cameraActive ? 'opacity-100' : 'opacity-40 blur-sm'} transition-all duration-500`}
                    autoPlay
                    playsInline
                    muted
                />
                {/* Máscara Escura para destacar o centro */}
                {cameraActive && (
                    <div className="absolute inset-0 bg-black/40 pointer-events-none" />
                )}
            </div>

            {/* 2. LAYER DE INTERFACE (Botões e Mira) */}

            {/* Header Flutuante */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20">
                <div className="flex flex-col text-white drop-shadow-md">
                    <span className="font-bold text-lg flex items-center gap-2">
                        <Zap className="fill-yellow-400 text-yellow-400 h-5 w-5" /> Scanner Ativo
                    </span>
                    <span className="text-xs opacity-80">Aponte para o Ticket</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="text-white bg-white/20 hover:bg-white/30 rounded-full h-10 w-10 backdrop-blur-md"
                >
                    <X />
                </Button>
            </div>

            {/* A MIRA (Square Box) - Só aparece quando ativo e sem resultado */}
            {cameraActive && !loading && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="w-72 h-72 border-2 border-white/50 rounded-3xl relative overflow-hidden shadow-[0_0_0_1000px_rgba(0,0,0,0.5)]">
                        {/* Cantos Brilhantes (Estilo App Nativo) */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg" />

                        {/* Scanner Laser Animation */}
                        <div className="absolute inset-x-0 h-0.5 bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.8)] top-1/2 animate-[scan_2s_ease-in-out_infinite]" />
                    </div>
                    <p className="absolute bottom-20 text-white/90 font-medium text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur">
                        Centralize o QR Code
                    </p>
                </div>
            )}

            {/* 3. LAYER DE RESULTADO (Cards) */}

            {/* Loading State */}
            {loading && (
                <div className="absolute inset-0 z-30 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in">
                        <Loader2 className="h-12 w-12 text-slate-900 animate-spin" />
                        <p className="text-slate-800 font-bold">Validando...</p>
                    </div>
                </div>
            )}

            {/* SUCESSO */}
            {orderData && (
                <div className="absolute bottom-0 left-0 right-0 p-6 z-40">
                    <Card className="w-full bg-white/95 backdrop-blur-xl border-t-8 border-t-green-500 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-full duration-500 rounded-t-[2rem] rounded-b-[2rem]">
                        <CardHeader className="text-center pb-2">
                            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-2 drop-shadow-lg" />
                            <CardTitle className="text-2xl font-black text-slate-800">Acesso Liberado!</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
                                <h3 className="font-bold text-xl text-slate-900">{orderData.menu_items?.name}</h3>
                                <p className="text-sm text-slate-500 mt-1">{orderData.users?.email}</p>
                            </div>

                            <div className="flex justify-between items-center px-4">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">
                                    {orderData.status === 'confirmed' ? 'CONFIRMADO' : orderData.status}
                                </span>
                            </div>

                            <Button onClick={resetScan} className="w-full h-14 text-lg font-bold bg-slate-900 text-white rounded-xl shadow-xl shadow-slate-900/20 hover:scale-[1.02] transition-transform">
                                Ler Próximo
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* ERRO */}
            {error && (
                <div className="absolute bottom-0 left-0 right-0 p-6 z-40">
                    <Card className="w-full bg-red-50/95 backdrop-blur-xl border-2 border-red-200 shadow-2xl animate-in shake rounded-[2rem]">
                        <CardContent className="flex flex-col items-center p-8 gap-4 text-center">
                            <div className="h-14 w-14 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="h-8 w-8 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-red-900">Falha na Leitura</h3>
                                <p className="text-red-700 mt-1">{error}</p>
                            </div>
                            <Button onClick={resetScan} variant="outline" className="w-full mt-2 border-red-200 text-red-700 hover:bg-red-100 h-12 rounded-xl font-bold">
                                Tentar Novamente
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

        </div>
    )
}
