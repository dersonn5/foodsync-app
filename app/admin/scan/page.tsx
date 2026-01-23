"use client"

import { useState, useEffect } from "react"
import { Scanner } from "@yudiel/react-qr-scanner"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2, ScanLine } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// Tipo do Pedido Completo
type OrderDetail = {
    id: string
    status: string
    consumption_date: string
    users: {
        email: string
        // Adicione 'name' se tiver na tabela users, caso contrário usa email
    }
    menu_items: {
        name: string
        image_url: string
    }
}

export default function ScanPage() {
    const [scannedResult, setScannedResult] = useState<string | null>(null)
    const [orderData, setOrderData] = useState<OrderDetail | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()
    const router = useRouter()

    // Função disparada ao ler um QR Code
    // Função disparada ao ler um QR Code
    // SUBSTITUA A FUNÇÃO handleScan POR ESTA VERSÃO BLINDADA:
    const handleScan = async (text: string) => {
        // 🛡️ TRAVA DE SEGURANÇA 1: Ignora leituras repetidas rápidas
        if (scannedResult === text) return

        // 🛡️ TRAVA DE SEGURANÇA 2 (ANTI-CÓDIGO DE BARRAS):
        // IDs do Supabase (UUID) SEMPRE têm traços (ex: a1b2-c3d4...).
        // Se o texto não tiver "-", é lixo ou código de barras. Ignora silenciosamente.
        if (!text.includes('-')) {
            console.log("Leitura ignorada (Provável código de barras/lixo):", text)
            return
        }

        // Se passou, é um potencial ID ou Link válido.
        setScannedResult(text)
        fetchOrderDetails(text)
    }

    // Busca os dados no banco
    const fetchOrderDetails = async (scannedText: string) => {
        setLoading(true)
        setError(null)

        // --- NOVA LÓGICA DE LIMPEZA ---
        let orderId = scannedText;

        // Se o texto lido for uma URL (contiver "/"), tenta pegar só a última parte
        if (scannedText.includes('/')) {
            const parts = scannedText.split('/');
            // Pega o último item após a última barra, e remove possíveis parâmetros de query (?foo=bar)
            orderId = parts[parts.length - 1].split('?')[0];
            console.log("URL detectada. ID extraído:", orderId);
        }
        // -----------------------------

        // Validação Regex (Agora usa o ID limpo)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(orderId)) {
            setLoading(false)
            // Mostra o texto original no erro para debug, mas avisa do formato
            setError("QR Code inválido. O formato não é um ID de pedido.")
            return
        }

        try {
            // Use o 'orderId' limpo aqui na busca
            const { data, error } = await supabase
                .from('orders').select(`
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
                // Opcional: Tocar um som de sucesso aqui
                new Audio('/notification.mp3').play().catch(() => { })
            }
        } catch (err) {
            console.error(err)
            setError("Erro ao buscar pedido. Tente novamente.")
        } finally {
            setLoading(false)
        }
    }

    // Função para "Resetar" e ler o próximo
    const resetScan = () => {
        setScannedResult(null)
        setOrderData(null)
        setError(null)
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-950 text-white p-4">
            {/* Header Simples */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <ScanLine className="text-green-500" /> Scanner
                </h1>
                <Button variant="ghost" className="text-slate-400" onClick={() => router.back()}>Fechar</Button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-6">

                {/* MODO CÂMERA (Só mostra se não tiver resultado ainda) */}
                {!orderData && !error && (
                    <div className="w-full max-w-sm aspect-square relative border-2 border-slate-700 rounded-3xl overflow-hidden shadow-2xl shadow-green-900/20">
                        {loading ? (
                            <div className="flex items-center justify-center h-full bg-slate-900">
                                <Loader2 className="animate-spin h-10 w-10 text-green-500" />
                            </div>
                        ) : (
                            <Scanner
                                onScan={(result) => {
                                    if (result && result[0] && result[0].rawValue) {
                                        handleScan(result[0].rawValue)
                                    }
                                }}
                                formats={['qr_code']}
                                onError={(error: any) => console.log(error?.message || error)}
                                scanDelay={300}
                                styles={{
                                    container: { width: '100%', height: '100%' }
                                }}
                            />
                        )}
                        {/* Mira Visual */}
                        <div className="absolute inset-0 border-[40px] border-slate-950/50 pointer-events-none flex items-center justify-center">
                            <div className="w-48 h-48 border-2 border-green-500 rounded-lg opacity-50 animate-pulse"></div>
                        </div>
                    </div>
                )}

                {/* FEEDBACK DE ERRO */}
                {error && (
                    <Card className="w-full bg-red-950 border-red-800 text-red-100">
                        <CardContent className="flex flex-col items-center p-6 gap-4">
                            <XCircle className="h-16 w-16 text-red-500" />
                            <p className="font-bold text-center">{error}</p>
                            <p className="text-xs opacity-70 break-all">{scannedResult}</p>
                            <Button onClick={resetScan} variant="secondary" className="w-full mt-2">Tentar Novamente</Button>
                        </CardContent>
                    </Card>
                )}

                {/* TICKET VÁLIDO (RESULTADO) */}
                {orderData && (
                    <Card className="w-full bg-white text-slate-900 animate-in slide-in-from-bottom-10 fade-in duration-300">
                        <CardHeader className="bg-green-50 border-b border-green-100 pb-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                                <div>
                                    <CardTitle className="text-lg text-green-800">Ticket Válido</CardTitle>
                                    <p className="text-xs text-green-600 font-medium uppercase tracking-wider">Confirmado</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">

                            {/* Detalhes do Prato */}
                            <div className="flex items-start gap-4">
                                {orderData.menu_items?.image_url && (
                                    <img src={orderData.menu_items.image_url} className="h-16 w-16 rounded-lg object-cover bg-slate-100" />
                                )}
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">{orderData.menu_items?.name}</h3>
                                    <p className="text-sm text-slate-500">{orderData.users?.email}</p>
                                </div>
                            </div>

                            <div className="h-px bg-slate-100 my-2" />

                            {/* Data e Status */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-slate-400 text-xs">Data Consumo</p>
                                    <p className="font-medium text-slate-700">
                                        {new Date(orderData.consumption_date).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs">Status Atual</p>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${orderData.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {orderData.status === 'confirmed' ? 'CONFIRMADO' : orderData.status}
                                    </span>
                                </div>
                            </div>

                            <Button className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white h-12 text-lg" onClick={resetScan}>
                                Ler Próximo
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {!orderData && !error && (
                    <p className="text-slate-400 text-sm text-center max-w-[200px]">
                        Aponte a câmera para o QR Code do funcionário
                    </p>
                )}

            </div>
        </div>
    )
}
