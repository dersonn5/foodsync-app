'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatDateUTC } from '@/lib/utils'
import { Loader2, Ticket as TicketIcon, CalendarClock, UtensilsCrossed, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Ticket from '@/components/Ticket'

// Basic order type for the list
interface OrderHistoryItem {
    id: string
    consumption_date: string
    status: string
    menu_items: {
        name: string
    }
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<OrderHistoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [userName, setUserName] = useState('')
    const [selectedOrder, setSelectedOrder] = useState<OrderHistoryItem | null>(null)

    useEffect(() => {
        async function fetchHistory() {
            // Get user from local storage
            const stored = localStorage.getItem('foodsync_user')
            if (!stored) return

            const user = JSON.parse(stored)
            setUserName(user.name.split(' ')[0]) // First name for ticket

            const { data, error } = await supabase
                .from('orders')
                .select('id, consumption_date, status, menu_items(name)')
                .eq('user_id', user.id)
                .order('consumption_date', { ascending: false })

            if (data) {
                // Filter out past orders (today + future)
                // Use local date string comparison
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
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl px-6 py-4 pt-12 sticky top-0 z-20 shadow-[0_4px_30px_-5px_rgba(0,0,0,0.03)] border-b border-gray-100/50">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Meus Pedidos</h1>
                        <p className="text-sm text-gray-400 font-medium">Sua carteira de refeições</p>
                    </div>
                    <div className="bg-green-50 p-2.5 rounded-xl text-green-600">
                        <TicketIcon className="w-6 h-6" />
                    </div>
                </div>
            </header>

            <main className="p-6 pb-32 space-y-5">
                {loading ? (
                    <div className="space-y-4 pt-4">
                        {[1, 2].map(i => (
                            <div key={i} className="h-28 bg-white rounded-2xl animate-pulse shadow-sm" />
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
                        className="space-y-4"
                    >
                        {orders.map(order => (
                            <motion.div
                                key={order.id}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                                onClick={() => setSelectedOrder(order)}
                                whileTap={{ scale: 0.98 }}
                                className="bg-white p-5 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100/80 cursor-pointer group active:border-green-200 transition-all flex items-center gap-5 relative overflow-hidden"
                            >
                                {/* Active Strip Indicator */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${order.status === 'confirmed' ? 'bg-green-500' : 'bg-amber-400'}`} />

                                <div className="h-14 w-14 bg-gray-50 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 border border-gray-100 group-hover:bg-white group-hover:shadow-md transition-all">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                        {formatDateUTC(order.consumption_date, "MMM")}
                                    </span>
                                    <span className="text-xl font-bold text-gray-900 leading-none">
                                        {formatDateUTC(order.consumption_date, "dd")}
                                    </span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 truncate leading-tight mb-1">{order.menu_items?.name || 'Prato Desconhecido'}</h3>
                                    <div className="flex items-center gap-2">
                                        {order.status === 'confirmed' ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wide border border-green-100">
                                                <Sparkles className="w-3 h-3" />
                                                Confirmado
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wide border border-amber-100">
                                                <CalendarClock className="w-3 h-3" />
                                                Pendente
                                            </span>
                                        )}
                                        <span className="text-xs text-gray-400 border-l pl-2 border-gray-200 capitalize">
                                            {formatDateUTC(order.consumption_date, "EEEE")}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-24 opacity-60 flex flex-col items-center">
                        <div className="bg-gray-100 p-6 rounded-full mb-4">
                            <UtensilsCrossed className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-600 tracking-tight">Vazio por aqui</h3>
                        <p className="text-sm text-gray-400 mt-1 max-w-[200px]">Você ainda não reservou nenhuma refeição futura.</p>
                    </div>
                )}
                )}
            </main >

            {/* Ticket Modal Component */}
            < Ticket
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                order={selectedOrder}
                userName={userName}
            />
        </div >
    )
}
