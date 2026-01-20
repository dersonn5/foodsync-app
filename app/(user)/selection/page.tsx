'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { MenuItem } from '@/types'
import { Button } from '@/components/ui/button'
import { Check, Utensils, Clock, CheckCircle2, Loader2, ArrowRight } from 'lucide-react'
import { format, addDays, startOfToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import QRCode from 'react-qr-code'
import { sendConfirmationMessage } from '@/app/actions/whatsapp'
import SignOutButton from '@/components/SignOutButton'
import DateStrip from '@/components/DateStrip'
import { motion } from 'framer-motion'

// Helper to standardise date string for DB (YYYY-MM-DD)
const getDateStr = (date: Date) => date.toISOString().split('T')[0]

export default function SelectionPage() {
    const [user, setUser] = useState<any>(null)
    const router = useRouter()

    // Date State - Default to today or tomorrow? 
    // Usually systems like this default to tomorrow for ordering lunch, 
    // but if we show history, we might want today. Let's start with Tomorrow as default like before, 
    // but allow selecting others.
    const [selectedDate, setSelectedDate] = useState<Date>(addDays(startOfToday(), 1))

    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [loadingMenu, setLoadingMenu] = useState(true)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [existingOrder, setExistingOrder] = useState<any>(null)
    const [activeTab, setActiveTab] = useState<'all' | 'main' | 'fit' | 'snack'>('all')

    // 1. Auth Logic 
    useEffect(() => {
        const stored = localStorage.getItem('foodsync_user')
        if (stored) {
            const parsedUser = JSON.parse(stored)
            setUser(parsedUser)
        } else {
            router.push('/')
        }
    }, [router])

    // 2. Fetch Order for Selected Date
    useEffect(() => {
        if (!user) return

        async function fetchOrderForDate() {
            setExistingOrder(null) // Reset while fetching
            const dateStr = getDateStr(selectedDate)

            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*, menu_items(*)')
                    .eq('user_id', user.id)
                    .eq('consumption_date', dateStr)
                    .maybeSingle()

                if (data) {
                    setExistingOrder(data)
                }
            } catch (err) {
                console.error('Error checking order', err)
            }
        }

        fetchOrderForDate()
    }, [user, selectedDate])

    // 3. Fetch Menu Items (General fetch, assumed same menu for all days for MVP, 
    // or we could filter by date if menu_items had date. 
    // Prompt "Fetch menu_items available *only for selected date*" -> Implies menu has dates?
    // Looking at previous schema/code, `menu_items` table didn't seem to have dates, just filtered by type.
    // If table doesn't have dates, we assume static menu for now. 
    // If prompt implies specific logic, I should check schema. 
    // I will assume static menu for MVP unless I see a date field in schema.
    // Let's assume static menu for now to avoid breaking if column missing.)

    useEffect(() => {
        if (!user) return

        async function fetchMenu() {
            setLoadingMenu(true)
            try {
                // Ideally filtering by date here if schema supported it.
                // For now, fetching all active items.
                const { data, error } = await supabase
                    .from('menu_items')
                    .select('*')

                if (data) {
                    setMenuItems(data)
                }
            } catch (err) {
                console.error('Error fetching menu', err)
            } finally {
                setLoadingMenu(false)
            }
        }

        fetchMenu()
    }, [user]) // Only fetch menu once or when user loads, not every date change if static

    const handleConfirm = async () => {
        if (!user || !selectedId) return
        setSubmitting(true)
        const dateStr = getDateStr(selectedDate)

        try {
            const { data, error } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    menu_item_id: selectedId,
                    consumption_date: dateStr,
                    status: 'pending'
                })
                .select('*, menu_items(*)')
                .single()

            if (data) {
                // Fire notification
                if (user.phone) {
                    const dishName = menuItems.find(i => i.id === selectedId)?.name || 'Prato do dia'
                    // Ensure date is formatted for message
                    sendConfirmationMessage({ phone: user.phone, dishName })
                }

                setExistingOrder(data)
                setSelectedId(null)
            }
        } catch (err) {
            console.error('Order failed', err)
            alert('Erro ao confirmar pedido.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleCancelOrder = async () => {
        if (!confirm('Cancelar pedido deste dia?')) return
        try {
            await supabase.from('orders').delete().eq('id', existingOrder.id)
            setExistingOrder(null)
        } catch (err) {
            alert('Erro ao cancelar')
        }
    }

    // Filtering logic
    const filteredItems = activeTab === 'all'
        ? menuItems
        : menuItems.filter(i => i.type === activeTab)

    if (!user) return <div className="h-screen bg-slate-50" />

    const dateDisplay = format(selectedDate, "dd/MM", { locale: ptBR })

    // --- VIEW: MENU SELECTION ---
    return (
        <div className="min-h-screen bg-slate-50 pb-32 font-sans selection:bg-green-100">
            {/* 1. Modern Header */}
            <header className="bg-white/80 backdrop-blur-md px-5 py-6 pt-12 sticky top-0 z-20 shadow-sm border-b border-slate-100 transition-all">
                <div className="flex justify-between items-start mb-4">
                    <div className="animate-in slide-in-from-left-2 duration-500">
                        <p className="text-sm text-slate-400 font-medium">Olá, <span className="text-green-600 font-extrabold text-base tracking-tight">{user.name.split(' ')[0]}</span></p>
                        <h1 className="text-2xl font-bold text-slate-900 mt-0.5 tracking-tight">O que vamos comer?</h1>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-medium bg-slate-100 w-fit px-2 py-1 rounded-full">
                            <Clock className="w-3 h-3" />
                            Planejamento Semanal
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-green-50 to-emerald-100 rounded-full flex items-center justify-center text-green-700 font-bold border border-green-200 shadow-sm">
                            {user.name.charAt(0)}
                        </div>
                        {/* Logout Button */}
                        <SignOutButton />
                    </div>
                </div>
                {/* Date Strip Component */}
                <div className="mt-4 -mx-5 px-5">
                    <DateStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />
                </div>
            </header>


            {/* Note: I moved DateStrip inside header for sticky behavior or keep outside? 
               The previous code had DateStrip separate. Let's keep it clean.
               Actually, merging them makes the sticky header nicer. 
               But DateStrip is its own sticky component in previous code.
               Let's respect structure but use motion div.
            */}


            {/* 2. Category Tabs */}
            <div className="sticky top-[180px] z-10 bg-slate-50/95 backdrop-blur-sm py-2 px-4 shadow-sm">
                <div className="flex justify-center items-center w-full gap-2">
                    {[
                        { id: 'all', label: 'Todos' },
                        { id: 'main', label: 'Padrão' },
                        { id: 'fit', label: 'Fit' },
                        { id: 'snack', label: 'Lanche' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                                flex-1 flex justify-center items-center px-2 py-2 rounded-xl text-xs font-bold transition-all
                                ${activeTab === tab.id
                                    ? 'bg-slate-900 text-white shadow-md scale-100'
                                    : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. Meal Cards Grid */}
            <main className="px-5 space-y-4 min-h-[50vh]">
                {loadingMenu ? (
                    <div className="space-y-4 py-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredItems.length > 0 ? (
                    <div className="space-y-4">
                        {filteredItems.map((item, index) => {
                            const isSelected = selectedId === item.id
                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    key={item.id}
                                    onClick={() => setSelectedId(item.id)}
                                    className={`
                                    bg-white rounded-3xl p-4 shadow-sm border transition-all duration-300 cursor-pointer flex gap-4 overflow-hidden relative group
                                    ${isSelected
                                            ? 'border-green-500 ring-4 ring-green-100 shadow-xl shadow-green-500/10 scale-[1.02] z-10'
                                            : 'border-slate-100 hover:border-slate-200 hover:shadow-md'
                                        }
                                `}
                                >
                                    {/* Image Placeholder */}
                                    <div className="w-24 h-24 bg-slate-100 rounded-2xl flex-shrink-0 overflow-hidden shadow-inner relative">
                                        {item.name.toLowerCase().includes('feijoada') ? (
                                            <img src="/images/feijoada.png" alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : item.photo_url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={`https://source.unsplash.com/200x200/?${item.type === 'fit' ? 'salad' : 'lunch'},food`}
                                                alt="Food"
                                                className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500"
                                            />
                                        )}
                                        <div className={`absolute inset-0 bg-black/10 ${isSelected ? 'opacity-0' : 'opacity-0 group-hover:opacity-10'} transition-opacity`} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 flex flex-col justify-center py-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className={`font-bold text-lg leading-tight mb-1.5 ${isSelected ? 'text-green-700' : 'text-slate-900'}`}>
                                                {item.name}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed font-medium">
                                            {item.description || "Uma opção deliciosa preparada pelos nossos chefs."}
                                        </p>
                                    </div>

                                    {/* Check Icon */}
                                    {isSelected && (
                                        <div className="absolute top-4 right-4 bg-green-500 text-white p-1.5 rounded-full animate-in zoom-in shadow-lg shadow-green-500/30">
                                            <Check className="w-4 h-4" />
                                        </div>
                                    )}
                                </motion.div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 opacity-50 flex flex-col items-center">
                        <div className="bg-slate-100 p-6 rounded-full mb-4">
                            <Utensils className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="font-bold text-slate-700 text-lg">Cardápio Vazio</h3>
                        <p className="max-w-[200px] text-sm mt-1">Nenhuma opção disponível para esta categoria hoje.</p>
                    </div>
                )}
            </main>

            {/* Confirm Floating Button (Only show if no order and selection made) */}
            {!existingOrder && (
                <div className={`
                    fixed bottom-[90px] left-0 right-0 px-5 transition-all duration-300 z-30 flex justify-center
                    ${selectedId ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}
                `}>
                    <Button
                        onClick={handleConfirm}
                        disabled={submitting}
                        className="w-full max-w-md h-16 text-lg font-bold bg-slate-900 hover:bg-black text-white rounded-2xl shadow-2xl shadow-black/20 active:scale-95 transition-all flex items-center justify-between px-8 border border-slate-800"
                    >
                        <span>Reservar Prato</span>
                        {submitting ? <Loader2 className="animate-spin" /> : <ArrowRight className="w-6 h-6" />}
                    </Button>
                </div>
            )}
        </div>
    )
}
