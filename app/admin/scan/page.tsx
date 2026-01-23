"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, ScanLine, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Html5QrcodePlugin } from "@/components/admin/html5-qrcode-plugin" // Importe o novo componente

// Tipo do Pedido
type OrderDetail = {
    id: string
    status: string
    consumption_date: string
    users: { email: string }
    menu_items: { name: string; image_url: string }
}

export default function ScanPage() {
    const [scannedResult, setScannedResult] = useState<string | null>(null)
    const [orderData, setOrderData] = useState<OrderDetail | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()
    const router = useRouter()

    const onNewScanResult = (decodedText: string, decodedResult: any) => {
        // 🛡️ Lógica de Proteção (Anti-Código de Barras)
        // Se já leu este mesmo código agora, ignora
        if (scannedResult === decodedText) return

        // Se não tiver traço '-', não é UUID (ignora silenciosamente)
        if (!decodedText.includes('-')) {
            console.log("Ignorado (Formato inválido):", decodedText)
            return
        }

        // Se passou, processa!
        console.log("Lido:", decodedText)
        setScannedResult(decodedText)
        fetchOrderDetails(decodedText)
    }

    const fetchOrderDetails = async (rawId: string) => {
        setLoading(true)
        setError(null)

        // Limpeza de URL (caso leia o link completo)
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
                setError("Pedido não encontrado no sistema.")
            } else {
                setOrderData(data as any)
                // Som de Sucesso (Opcional)
                // new Audio('/success.mp3').play().catch(()=>{})
            }
        } catch (err) {
            console.error(err)
            setError("Erro ao buscar. QR Code inválido ou erro de rede.")
        } finally {
            setLoading(false)
        }
    }

    const resetScan = () => {
        setScannedResult(null)
        setOrderData(null)
        setError(null)
        // Recarrega a página para reiniciar o componente limpo (solução mais estável para html5-qrcode)
        window.location.reload()
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-950 text-white p-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <ScanLine className="text-green-500" /> Scanner Pro
                </h1>
                <Button variant="ghost" className="text-slate-400" onClick={() => router.back()}>Fechar</Button>
            </div>

            <div className="flex-1 flex flex-col items-center gap-6 max-w-md mx-auto w-full">

                {/* ÁREA DO SCANNER */}
                {!orderData && !error && (
                    <div className="w-full">
                        <Html5QrcodePlugin
                            fps={10} // 10 Scans por segundo
                            qrbox={250} // Tamanho da caixa de foco
                            disableFlip={false}
                            qrCodeSuccessCallback={onNewScanResult}
                        />
                        <p className="text-center text-slate-500 text-xs mt-4">
                            Aponte para o QR Code. Se pedir permissão, aceite.
                        </p>
                    </div>
                )}

                {/* FEEDBACK DE ERRO */}
                {error && (
                    <Card className="w-full bg-red-950 border-red-800 text-red-100 animate-in zoom-in-95">
                        <CardContent className="flex flex-col items-center p-6 gap-4">
                            <AlertTriangle className="h-16 w-16 text-red-500" />
                            <p className="font-bold text-center">{error}</p>
                            <Button onClick={resetScan} variant="secondary" className="w-full mt-2">Ler Outro</Button>
                        </CardContent>
                    </Card>
                )}

                {/* TICKET VÁLIDO */}
                {orderData && (
                    <Card className="w-full bg-white text-slate-900 animate-in slide-in-from-bottom-10 fade-in duration-300 border-t-8 border-t-green-500">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-10 w-10 text-green-600" />
                                <div>
                                    <CardTitle className="text-xl text-green-800">Liberado!</CardTitle>
                                    <p className="text-xs text-slate-500 font-medium uppercase">Ticket Validado</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="text-center">
                                <h3 className="font-bold text-2xl leading-tight mb-1">{orderData.menu_items?.name}</h3>
                                <p className="text-sm text-slate-500">{orderData.users?.email}</p>
                            </div>

                            <div className="bg-slate-100 p-4 rounded-xl text-center">
                                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Status do Pedido</p>
                                <span className={`text-lg font-bold ${orderData.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'
                                    }`}>
                                    {orderData.status === 'confirmed' ? 'CONFIRMADO ✅' : orderData.status.toUpperCase()}
                                </span>
                            </div>

                            <Button className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white h-14 text-lg rounded-xl shadow-lg shadow-slate-900/20" onClick={resetScan}>
                                Ler Próximo Pedido
                            </Button>
                        </CardContent>
                    </Card>
                )}

            </div>
        </div>
    )
}
