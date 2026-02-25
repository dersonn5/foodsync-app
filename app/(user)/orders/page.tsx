'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatDateUTC, formatDateDisplay } from '@/lib/utils'
import { Loader2, Ticket as TicketIcon, CalendarClock, UtensilsCrossed, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { OrderTicketDialog } from "@/components/app/order-ticket-dialog"

// Basic order type for the list
interface OrderHistoryItem {
    id: string
    short_id?: string
    consumption_date: string
    status: string
    menu_items: {
        name: string
    }
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<OrderHistoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState<OrderHistoryItem | null>(null)
    const [isTicketOpen, setIsTicketOpen] = useState(false)

    useEffect(() => {
        async function fetchHistory() {
            const stored = localStorage.getItem('kitchenos_user')
            if (!stored) return

            const user = JSON.parse(stored)

            const { data, error } = await supabase
                .from('orders')
                .select('id, short_id, consumption_date, status, menu_items(name)')
                .eq('user_id', user.id)
                .order('consumption_date', { ascending: false })

            if (data) {
                const todayStr = format(new Date(), 'yyyy-MM-dd')
                const upcomingOrders = (data as any).filter((o: OrderHistoryItem) => {
                    return o.consumption_date >= todayStr
                })
                setOrders(upcomingOrders)
            }
            setLoading(false)
        }
        fetchHistory()
    }, [])

    return (
        <div className="min-h-screen bg-transparent font-sans">
            {/* Header */}
            <header id="tour-emp-orders-header" className="bg-white/80 backdrop-blur-xl px-6 py-4 pt-12 sticky top-0 z-20 shadow-sm border-b border-slate-200/60">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl shadow-lg shadow-brand-900/10" style={{ backgroundColor: '#0F2A1D' }}>
                            <TicketIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight" style={{ color: '#0F2A1D' }}>Meus Pedidos</h1>
                            <p className="text-xs" style={{ color: '#517252' }}>Sua carteira de refeições</p>
                        </div>
                    </div>
                </div>
            </header>

            <main id="tour-emp-orders-list" className="p-6 pb-32 space-y-4">
                {loading ? (
                    <div className="space-y-4 pt-4">
                        {[1, 2].map(i => (
                            <div key={i} className="h-24 bg-white/60 rounded-2xl animate-pulse border border-slate-200/60" />
                        ))}
                    </div>
                ) : orders.length > 0 ? (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: { staggerChildren: 0.1 }
                            }
                        }}
                        className="space-y-3"
                    >
                        {orders.map(order => (
                            <motion.div
                                key={order.id}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                                onClick={() => {
                                    setSelectedOrder(order)
                                    setIsTicketOpen(true)
                                }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-white/60 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/60 cursor-pointer group hover:shadow-md hover:border-slate-300 transition-all flex items-center gap-4 relative overflow-hidden"
                            >
                                {/* Active Strip Indicator */}
                                <div
                                    className={`absolute left-0 top-0 bottom-0 w-1 ${order.status !== 'confirmed' && 'bg-amber-400'}`}
                                    style={order.status === 'confirmed' ? { backgroundColor: '#0F2A1D' } : {}}
                                />

                                <div className="h-14 w-auto px-4 bg-slate-50/80 rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-100 group-hover:bg-white group-hover:shadow-sm transition-all ml-2">
                                    <span className="text-sm font-bold text-slate-700 capitalize leading-none">
                                        {formatDateDisplay(order.consumption_date)}
                                    </span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold truncate leading-tight mb-1.5" style={{ color: '#0F2A1D' }}>{order.menu_items?.name || 'Prato Desconhecido'}</h3>
                                    <div className="flex items-center gap-2">
                                        {order.status === 'confirmed' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 text-brand-800 text-[10px] font-bold uppercase tracking-wide border border-brand-200">
                                                <Sparkles className="w-3 h-3" />
                                                Confirmado
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wide border border-amber-200">
                                                <CalendarClock className="w-3 h-3" />
                                                Pendente
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-24 flex flex-col items-center">
                        <div className="w-20 h-20 bg-slate-100/80 rounded-2xl flex items-center justify-center mb-4 border border-slate-200/60">
                            <UtensilsCrossed className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold tracking-tight mb-1" style={{ color: '#0F2A1D' }}>Vazio por aqui</h3>
                        <p className="text-sm max-w-[220px]" style={{ color: '#517252' }}>Você ainda não reservou nenhuma refeição futura.</p>
                    </div>
                )}

            </main>

            {/* Ticket Modal Component */}
            <OrderTicketDialog
                isOpen={isTicketOpen}
                onClose={() => setIsTicketOpen(false)}
                order={selectedOrder}
            />
        </div>
    )
}

