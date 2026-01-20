'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Loader2, Ticket, CalendarClock } from 'lucide-react'
import QRCode from 'react-qr-code'

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

    useEffect(() => {
        async function fetchHistory() {
            // Get user from local storage (or context)
            const stored = localStorage.getItem('foodsync_user')
            if (!stored) return

            const user = JSON.parse(stored)

            const { data, error } = await supabase
                .from('orders')
                .select('id, consumption_date, status, menu_items(name)')
                .eq('user_id', user.id)
                .order('consumption_date', { ascending: false }) // Newest first

            if (data) {
                // Filter out past orders (keep today + future)
                // "Remove 18... only from 19".
                // We'll standardise "today" as YYYY-MM-DD text comparison for simplicity.
                // Fix: use local date string, not UTC, to ensure we don't skip today if late night.
                const todayStr = format(new Date(), 'yyyy-MM-dd')

                const upcomingOrders = (data as any).filter((o: OrderHistoryItem) => {
                    // Assuming consumption_date is YYYY-MM-DD or ISO
                    return o.consumption_date >= todayStr
                })

                setOrders(upcomingOrders)
            }
            setLoading(false)
        }
        fetchHistory()
    }, [])

    // State for selected order to show message
    const [selectedOrder, setSelectedOrder] = useState<OrderHistoryItem | null>(null)

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white px-6 py-6 pt-12 text-center sticky top-0 z-10 shadow-sm">
                <h1 className="text-xl font-bold text-slate-900 flex items-center justify-center gap-2">
                    <Ticket className="w-5 h-5 text-green-600" />
                    Meus Pedidos
                </h1>
            </header>

            <main className="p-6 pb-32 space-y-4">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin text-slate-300" />
                    </div>
                ) : orders.length > 0 ? (
                    orders.map(order => (
                        <div
                            key={order.id}
                            onClick={() => setSelectedOrder(order)}
                            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-all active:scale-95 cursor-pointer hover:bg-slate-50"
                        >
                            <div className="h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0 text-green-600 font-bold text-xs uppercase text-center leading-none">
                                {format(new Date(order.consumption_date), "dd\nMMM", { locale: ptBR })}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-slate-900 truncate">{order.menu_items?.name || 'Prato Desconhecido'}</h3>
                                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                    <CalendarClock className="w-3 h-3" />
                                    {format(new Date(order.consumption_date), "EEEE", { locale: ptBR })}
                                </p>
                            </div>

                            <div className={`
                                px-2 py-1 rounded-full text-[10px] font-bold uppercase
                                ${order.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}
                            `}>
                                {order.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 opacity-50">
                        <Ticket className="w-16 h-16 mx-auto mb-4 text-slate-200" />
                        <h3 className="text-lg font-bold text-slate-400">Nenhum pedido</h3>
                        <p className="text-sm text-slate-300">Seus agendamentos aparecerão aqui.</p>
                    </div>
                )}
            </main>

            {/* QR Modal Overlay */}
            {selectedOrder && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6 animate-in fade-in"
                    onClick={() => setSelectedOrder(null)}
                >
                    <div
                        className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-1">Este é seu Ticket</h2>
                            <p className="text-slate-400 text-sm">Apresente isso no balcão da cozinha.</p>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 mb-6 flex justify-center">
                            {/* We need to import QRCode first! I noticed I missed adding the import in this block. 
                               Wait, I need to check if QRCode is imported. 
                               It WAS NOT imported in previous view_file. 
                               I will add it now or in a separate edit if I can't do it here easily since I am replacing logic block.
                               Actually I can verify imports. 
                               I will assume I need to add import too. 
                            */}
                            {/* Fallback if QRCode not available or just render it assuming I fix imports next */}
                            <QRCode value={selectedOrder.id} size={180} />
                        </div>

                        <div className="bg-green-50 p-4 rounded-xl mb-6 text-center">
                            <h3 className="font-bold text-green-800 text-sm mb-1">{selectedOrder.menu_items?.name}</h3>
                            <p className="text-green-600 text-xs">
                                {format(new Date(selectedOrder.consumption_date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                            </p>
                        </div>

                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="w-full bg-slate-900 text-white font-bold h-12 rounded-xl active:scale-95 transition-all"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
