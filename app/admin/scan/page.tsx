"use client"

import { useState } from "react"
import { ScannerPro } from "@/components/app/ScannerPro"
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
    const [orderData, setOrderData] = useState<OrderDetail | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [manualCode, setManualCode] = useState("")
    const [showManualInput, setShowManualInput] = useState(false)
    const [cameraActive, setCameraActive] = useState(true)

    const supabase = createClient()
    const router = useRouter()

    const handleScanSuccess = (decodedText: string) => {
        if (!decodedText || loading || orderData) return;

        setCameraActive(false);
        fetchOrderDetails(decodedText);
    }

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
            query = query.eq('short_id', cleanCode.toUpperCase())
        } else {
            const cleanId = cleanCode.includes('/') ? cleanCode.split('/').pop()?.split('?')[0] : cleanCode;
            query = query.eq('id', cleanId)
        }

        try {
            const { data, error } = await query.single()

            if (error || !data) {
                setError(`Código: ${cleanCode}. Não encontrado.`)
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
        <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col font-sans">

            {/* 1. BACKGROUND / SCANNER AREA */}
            <div className="flex-1 relative flex items-center justify-center p-6 pb-20">
                {cameraActive && !orderData && !error && !showManualInput ? (
                    <div className="w-full max-w-sm animate-in fade-in zoom-in duration-500">
                        <ScannerPro onScanSuccess={handleScanSuccess} />
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-all duration-500" />
                )}
            </div>

            {/* 2. HEADER */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20">
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white font-medium flex items-center gap-2 shadow-lg">
                    <Zap size={16} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-bold tracking-wide uppercase">Native Hub</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="bg-white/10 text-white rounded-full hover:bg-white/20 border border-white/10 backdrop-blur-md h-10 w-10">
                    <X size={20} />
                </Button>
            </div>

            {/* 3. MANUAL INPUT OVERLAY */}
            {!orderData && !loading && !error && showManualInput && (
                <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-xl animate-in fade-in">
                    <div className="w-full max-w-sm space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-black text-white">Entrada Manual</h2>
                            <p className="text-slate-400">Digite o Short ID do ticket</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-3xl border border-white/10 space-y-4">
                            <Input
                                autoFocus
                                placeholder="Ex: A5BFC9"
                                className="text-3xl text-center uppercase tracking-[0.3em] font-mono font-bold border-0 bg-white/5 focus-visible:ring-0 h-20 text-white placeholder:text-white/10"
                                value={manualCode}
                                maxLength={6}
                                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                            />
                            <Button onClick={() => fetchOrderDetails(manualCode)} className="w-full bg-green-500 hover:bg-green-600 text-white rounded-2xl h-14 font-black text-lg shadow-xl shadow-green-500/20">
                                VALIDAR TICKET
                            </Button>
                        </div>

                        <Button variant="ghost" onClick={() => { setShowManualInput(false); setCameraActive(true); }} className="w-full text-slate-400 hover:text-white">
                            Voltar para Câmera
                        </Button>
                    </div>
                </div>
            )}

            {/* 4. ACTIONS BAR */}
            {!orderData && !loading && !error && !showManualInput && (
                <div className="absolute bottom-12 left-0 right-0 flex justify-center z-20 px-6">
                    <Button
                        onClick={() => { setCameraActive(false); setShowManualInput(true); }}
                        className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 rounded-full px-8 h-14 gap-3 shadow-xl transition-all hover:scale-105 font-bold"
                    >
                        <Keyboard size={20} /> Entrada Manual
                    </Button>
                </div>
            )}

            {/* 5. LOADING / ERROR / SUCCESS CARDS */}
            {loading && (
                <div className="absolute inset-0 z-40 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md">
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-6">
                        <Loader2 className="h-12 w-12 text-slate-900 animate-spin" />
                        <p className="font-black text-xl text-slate-900 uppercase tracking-tighter">Validando...</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute bottom-0 left-0 right-0 p-6 z-40">
                    <Card className="w-full bg-red-600 border-0 shadow-2xl animate-in shake rounded-[2.5rem] overflow-hidden">
                        <CardContent className="flex flex-col items-center p-10 gap-6 text-center">
                            <div className="bg-white/20 p-4 rounded-full">
                                <AlertCircle className="h-10 w-10 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Falha na Leitura</h3>
                                <p className="text-red-100 mt-2 font-medium">{error}</p>
                            </div>
                            <Button onClick={() => { setError(null); setCameraActive(true); }} className="w-full bg-white text-red-600 hover:bg-red-50 h-16 rounded-2xl font-black text-xl shadow-xl transition-all active:scale-95">
                                TENTAR DE NOVO
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {orderData && (
                <div className="absolute bottom-0 left-0 right-0 p-6 z-40">
                    <Card className="w-full bg-white border-0 shadow-2xl animate-in slide-in-from-bottom-full duration-700 rounded-[3rem] overflow-hidden">
                        <div className="h-3 bg-green-500 w-full" />
                        <CardHeader className="text-center pb-2 pt-10">
                            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="h-10 w-10 text-green-600" />
                            </div>
                            <CardTitle className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Liberado!</CardTitle>
                            <p className="text-slate-400 font-bold tracking-widest text-[10px] mt-2">PEDIDO AUTORIZADO</p>
                        </CardHeader>
                        <CardContent className="space-y-8 pt-6 pb-10 px-8">
                            <div className="bg-slate-50 p-8 rounded-[2rem] text-center border border-slate-100 shadow-inner space-y-2">
                                <h3 className="font-black text-2xl text-slate-900 leading-tight">{orderData.menu_items?.name}</h3>
                                <p className="text-sm font-bold text-green-600 bg-green-50 inline-block px-4 py-1 rounded-full">{orderData.users?.email}</p>
                                <div className="pt-4 mt-4 border-t border-slate-100">
                                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1">Identificador</p>
                                    <p className="text-2xl font-mono font-black text-slate-400 tracking-[0.2em]">{orderData.short_id}</p>
                                </div>
                            </div>
                            <Button onClick={resetScan} className="w-full h-20 text-2xl font-black bg-slate-950 text-white rounded-[1.5rem] shadow-2xl hover:scale-[1.02] transition-all active:scale-95 uppercase tracking-tighter">
                                Ler Próximo
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

        </div>
    )
}
