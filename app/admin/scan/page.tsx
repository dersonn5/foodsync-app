"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, X, ScanLine, Loader2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useZxing } from "react-zxing"

// --- TIPOS ---
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
    const [loadingFetch, setLoadingFetch] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [cameraActive, setCameraActive] = useState(true) // Controla se a câmera está ligada

    const supabase = createClient()
    const router = useRouter()

    // --- CONFIGURAÇÃO DO MOTOR DE SCAN (HOOK) ---
    const { ref } = useZxing({
        paused: !cameraActive, // Pausa a câmera quando já leu um ticket
        onDecodeResult(decodedResult) {
            const text = decodedResult.getText()

            // 🛡️ BARREIRA: Se já leu este, ignora.
            if (text === result) return
            // 🛡️ BARREIRA: Se não tem traço '-', não é um ID válido. Ignora.
            if (!text.includes('-')) return

            setResult(text)
            setCameraActive(false) // ⏸️ PAUSA A CÂMERA para economizar recurso e não ler de novo

            // Toca um som sutil de "bip" (opcional, se quiser adicione o arquivo)
            // new Audio('/beep.mp3').play().catch(()=>{})

            fetchOrderDetails(text)
        },
        onError(error) {
            // Erros de leitura normais (quando não tem QR code na tela)
            // console.log(error); 
        },
        // Configurações para melhorar leitura em telas
        timeBetweenDecodingAttempts: 300, // Tenta 3 vezes por segundo
        constraints: {
            video: { facingMode: "environment" } // Força câmera traseira
        }
    });

    // --- BUSCA NO BANCO (Mesma lógica anterior) ---
    const fetchOrderDetails = async (rawId: string) => {
        setLoadingFetch(true)
        setError(null)

        let orderId = rawId
        // Limpeza de URL se necessário
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
            }
        } catch (err) {
            console.error(err)
            setError("Não foi possível validar este código.")
        } finally {
            setLoadingFetch(false)
        }
    }

    // --- RESET PARA O PRÓXIMO ---
    const resetScan = () => {
        setResult("")
        setOrderData(null)
        setError(null)
        setCameraActive(true) // ▶️ RELIGA A CÂMERA
    }

    return (
        <div className="relative flex flex-col items-center justify-center min-h-[100dvh] bg-black overflow-hidden">

            {/* --- CAMADA 1: O VÍDEO (FUNDO) --- */}
            <div className="absolute inset-0 w-full h-full">
                {/* O elemento de vídeo que o hook controla */}
                <video
                    ref={ref}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${cameraActive ? 'opacity-100' : 'opacity-20 blur-sm'}`}
                    autoPlay
                    playsInline // Importante para iOS
                    muted
                />
                {/* Overlay escuro para dar destaque à mira */}
                {cameraActive && <div className="absolute inset-0 bg-black/30" />}
            </div>


            {/* --- CAMADA 2: INTERFACE (TOPO) --- */}

            {/* Botão Fechar (Canto Superior) */}
            <Button
                variant="ghost" size="icon"
                className="absolute top-12 right-6 text-white bg-black/40 hover:bg-black/60 rounded-full z-50"
                onClick={() => router.back()}
            >
                <X />
            </Button>

            {/* MIRA CENTRAL (Estilo iPhone) - Só aparece quando buscando */}
            {cameraActive && !loadingFetch && (
                <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
                    {/* O quadrado da mira */}
                    <div className="w-64 h-64 border-2 border-white/70 rounded-3xl relative overflow-hidden shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
                        {/* Cantoneiras brilhantes */}
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-400 rounded-tl-xl"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-400 rounded-tr-xl"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-400 rounded-bl-xl"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-400 rounded-br-xl"></div>

                        {/* Linha de scan animada */}
                        <div className="absolute inset-x-0 h-1 bg-green-400/50 top-1/2 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
                    </div>
                    <p className="text-white/80 text-sm mt-6 font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur-md">
                        Aponte para o Ticket do Funcionário
                    </p>
                </div>
            )}


            {/* --- CAMADA 3: RESULTADOS (CARD FLUTUANTE) --- */}

            {/* LOADING */}
            {loadingFetch && (
                <div className="absolute z-30 flex flex-col items-center justify-center p-6 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl animate-in fade-in zoom-in">
                    <Loader2 className="h-12 w-12 text-green-600 animate-spin mb-4" />
                    <p className="text-slate-800 font-bold">Validando Ticket...</p>
                </div>
            )}

            {/* TICKET VÁLIDO (Sucesso) */}
            {orderData && (
                <Card className="absolute z-30 w-[90%] max-w-sm bg-white/95 backdrop-blur-xl text-slate-900 animate-in slide-in-from-bottom-10 duration-300 border-t-8 border-t-green-500 shadow-2xl rounded-3xl">
                    <CardHeader className="bg-green-50/50 pb-4 rounded-t-2xl">
                        <div className="flex items-center gap-3 justify-center flex-col">
                            <CheckCircle2 className="h-14 w-14 text-green-500 drop-shadow-sm" />
                            <div className="text-center">
                                <CardTitle className="text-2xl text-green-800 font-black tracking-tight">Acesso Liberado!</CardTitle>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="text-center">
                            <h3 className="font-bold text-2xl leading-tight mb-2 text-slate-900">{orderData.menu_items?.name}</h3>
                            <p className="text-sm font-medium text-slate-500 bg-slate-100 py-1 px-3 rounded-full inline-block">{orderData.users?.email}</p>
                        </div>

                        <div className={`p-4 rounded-2xl text-center border-2 ${orderData.status === 'confirmed' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                            }`}>
                            <p className="text-xs uppercase tracking-widest font-bold mb-1 opacity-70">Status</p>
                            <span className="text-xl font-black">
                                {orderData.status === 'confirmed' ? 'CONFIRMADO ✅' : orderData.status.toUpperCase()}
                            </span>
                        </div>

                        <Button className="w-full bg-slate-900 hover:bg-slate-800 hover:scale-[1.02] transition-all text-white h-14 text-lg rounded-2xl shadow-xl font-bold" onClick={resetScan}>
                            Ler Próximo Pedido
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* MENSAGEM DE ERRO */}
            {error && (
                <Card className="absolute z-30 w-[90%] max-w-sm bg-red-50/95 backdrop-blur-xl border-2 border-red-200 text-red-900 animate-in zoom-in-95 shadow-2xl rounded-3xl">
                    <CardContent className="flex flex-col items-center p-8 gap-4 text-center">
                        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
                            <AlertCircle className="h-10 w-10 text-red-600" />
                        </div>
                        <p className="font-bold text-xl">{error}</p>
                        <p className="text-sm text-red-700/70">O código lido não é um pedido válido ou houve um erro de conexão.</p>
                        <Button onClick={resetScan} variant="outline" className="w-full mt-4 bg-white border-red-200 hover:bg-red-50 text-red-700 h-12 rounded-xl font-bold">Tentar Novamente</Button>
                    </CardContent>
                </Card>
            )}

        </div>
    )
}
