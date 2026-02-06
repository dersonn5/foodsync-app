'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { MenuItem } from '@/types'
import { Button } from '@/components/ui/button'
import { Check, Utensils, Loader2, ArrowRight, CalendarX, Plus, ChefHat } from 'lucide-react'
import { format, startOfToday, parseISO, isValid, addDays, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { sendConfirmationMessage } from '@/app/actions/whatsapp'
import SignOutButton from '@/components/SignOutButton'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

// Helper to standardise date string for DB (YYYY-MM-DD)
const getDateStr = (date: Date) => format(date, 'yyyy-MM-dd')

function SelectionContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Auth State
    const [user, setUser] = useState<any>(null)

    // Date State
    const dateParam = searchParams.get('date')
    const initialDate = dateParam && isValid(parseISO(dateParam))
        ? parseISO(dateParam)
        : startOfToday()

    const [selectedDate, setSelectedDate] = useState<Date>(initialDate)
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [loadingMenu, setLoadingMenu] = useState(true)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [existingOrder, setExistingOrder] = useState<any>(null)
    const [activeTab, setActiveTab] = useState<'all' | 'main' | 'fit' | 'snack'>('all')

    // Generate next 14 days for calendar
    const calendarDays = Array.from({ length: 14 }, (_, i) => addDays(startOfToday(), i))

    // 0. Sync URL on Date Change
    const handleDateChange = (date: Date) => {
        setSelectedDate(date)
        const str = getDateStr(date)
        router.push(`/selection?date=${str}`)
    }

    // 1. Auth Logic 
    useEffect(() => {
        const stored = localStorage.getItem('kitchenos_user')
        if (stored) {
            setUser(JSON.parse(stored))
        } else {
            router.push('/')
        }
    }, [router])

    // 2. Fetch Order & Menu for Selected Date
    useEffect(() => {
        if (!user) return

        async function fetchData() {
            setLoadingMenu(true)
            setExistingOrder(null)
            const dateStr = getDateStr(selectedDate)

            try {
                // A. Check existing order
                const { data: orderData } = await supabase
                    .from('orders')
                    .select('*, menu_items(*)')
                    .eq('user_id', user.id)
                    .eq('consumption_date', dateStr)
                    .maybeSingle()

                if (orderData) setExistingOrder(orderData)

                // B. Fetch Menu Items for Date
                const { data: menuData, error: menuError } = await supabase
                    .from('menu_items')
                    .select('*')
                    .eq('date', dateStr)
                    .order('created_at')

                if (menuError) throw menuError
                setMenuItems(menuData || [])

            } catch (err) {
                console.error('Error fetching data', err)
            } finally {
                setLoadingMenu(false)
            }
        }

        fetchData()
    }, [user, selectedDate])

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
                if (user.phone) {
                    const dishName = menuItems.find(i => i.id === selectedId)?.name || 'Prato do dia'
                    sendConfirmationMessage({ phone: user.phone, dishName }).catch(console.error)
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

    const filteredItems = activeTab === 'all'
        ? menuItems
        : menuItems.filter(i => i.type === activeTab)

    if (!user) return (
        <div className="h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100 flex items-center justify-center">
            <Loader2 className="animate-spin text-emerald-600 w-8 h-8" />
        </div>
    )

    return (
        <div className="flex flex-col h-[100dvh] bg-transparent">

            {/* HEADER */}
            <header className="flex-none bg-white/80 backdrop-blur-xl shadow-sm z-20 relative border-b border-stone-200/60">
                {/* Top Gradient Bar */}
                <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

                {/* Profile & Greeting */}
                <div className="px-6 pt-8 pb-4 flex justify-between items-center">
                    <div>
                        <span className="text-sm text-stone-500 font-medium">Bom almoço,</span>
                        <h1 className="text-2xl font-bold text-stone-800 tracking-tight flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 mr-1">
                                <ChefHat className="w-5 h-5 text-white" />
                            </div>
                            {user.name.split(' ')[0]}
                        </h1>
                    </div>

                    <SignOutButton />
                </div>

                {/* Calendar Pills */}
                <div className="pb-5 pl-6 overflow-x-auto hide-scrollbar flex gap-2 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {calendarDays.map((date) => {
                        const isSelected = isSameDay(date, selectedDate)

                        return (
                            <button
                                key={date.toISOString()}
                                onClick={() => handleDateChange(date)}
                                className={cn(
                                    "flex flex-col items-center justify-center min-w-[56px] h-[68px] rounded-2xl border transition-all duration-300 active:scale-95 flex-shrink-0",
                                    isSelected
                                        ? "bg-gradient-to-br from-emerald-500 to-teal-600 border-transparent text-white shadow-lg shadow-emerald-500/25"
                                        : "bg-white border-stone-200/60 text-stone-500 hover:border-emerald-200 hover:bg-emerald-50/50"
                                )}
                            >
                                <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-widest mb-0.5",
                                    isSelected ? "text-white/70" : "text-stone-400"
                                )}>
                                    {format(date, 'EEE', { locale: ptBR }).replace('.', '')}
                                </span>
                                <span className={cn(
                                    "text-xl font-black",
                                    isSelected ? "text-white" : "text-stone-700"
                                )}>
                                    {format(date, 'd')}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </header>

            {/* BODY WITH SCROLL */}
            <main className="flex-1 overflow-y-auto scroll-smooth">
                <div className="px-6 py-6 pb-32 space-y-6">

                    {/* Filter Chips */}
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-6 px-6 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {[
                            { id: 'all', label: 'Todos' },
                            { id: 'main', label: 'Padrão' },
                            { id: 'fit', label: 'Fit' },
                            { id: 'snack', label: 'Lanche' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "px-5 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all flex-shrink-0 border",
                                    activeTab === tab.id
                                        ? "bg-stone-800 text-white border-stone-800 shadow-md"
                                        : "bg-white text-stone-600 border-stone-200/60 hover:bg-stone-50 hover:border-stone-300"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Section Title */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-emerald-50">
                                <Utensils className="w-4 h-4 text-emerald-600" />
                            </div>
                            Cardápio do Dia
                        </h2>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                            {filteredItems.length} {filteredItems.length === 1 ? 'Opção' : 'Opções'}
                        </span>
                    </div>

                    {/* Menu Cards */}
                    <div className="space-y-4">
                        <AnimatePresence mode="wait">
                            {loadingMenu ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-stone-200/60" />
                                    ))}
                                </motion.div>
                            ) : filteredItems.length > 0 ? (
                                filteredItems.map((item) => {
                                    const isSelected = selectedId === item.id
                                    const isOrdered = existingOrder?.menu_item_id === item.id
                                    return (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={cn(
                                                "group bg-white rounded-2xl p-4 border flex gap-4 active:scale-[0.98] transition-all duration-200 cursor-pointer",
                                                isSelected
                                                    ? "border-emerald-400 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/10"
                                                    : "border-stone-200/60 hover:border-stone-300 hover:shadow-md"
                                            )}
                                            onClick={() => !existingOrder && setSelectedId(item.id)}
                                        >
                                            {/* Image */}
                                            <div
                                                className="h-28 w-28 flex-none rounded-xl bg-stone-100 bg-cover bg-center relative overflow-hidden"
                                                style={{ backgroundImage: item.photo_url ? `url(${item.photo_url})` : 'none' }}
                                            >
                                                {!item.photo_url && (
                                                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                                                        <Utensils className="w-8 h-8" />
                                                    </div>
                                                )}
                                                {isOrdered && (
                                                    <div className="absolute inset-0 bg-emerald-500/30 flex items-center justify-center backdrop-blur-[2px]">
                                                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                                                            <Check className="text-white w-6 h-6" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col justify-between flex-1 py-1">
                                                <div>
                                                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                                                        {item.type === 'main' ? 'Padrão' : item.type}
                                                    </span>
                                                    <h3 className="font-bold text-stone-800 leading-tight mt-1 text-lg line-clamp-2">
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                                                        {item.description || "Sem descrição disponível."}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs font-medium text-stone-400">
                                                        450kcal
                                                    </span>
                                                    <button
                                                        className={cn(
                                                            "h-9 w-9 rounded-xl flex items-center justify-center transition-all",
                                                            isSelected
                                                                ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                                                                : "bg-stone-100 text-stone-500 hover:bg-emerald-50 hover:text-emerald-600"
                                                        )}
                                                    >
                                                        {isSelected ? <Check size={18} /> : <Plus size={18} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="w-20 h-20 bg-stone-100 rounded-2xl flex items-center justify-center mb-4">
                                        <CalendarX className="text-stone-300 w-10 h-10" />
                                    </div>
                                    <h3 className="font-bold text-stone-600 mb-1">Nenhum prato disponível</h3>
                                    <p className="text-stone-400 text-sm max-w-[200px]">O cardápio para esta data ainda não foi publicado.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </main>

            {/* Floating Action Button */}
            <AnimatePresence>
                {existingOrder ? (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-24 left-4 right-4 z-40 flex justify-center"
                    >
                        <div className="w-full bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-stone-200/60 flex items-center justify-between gap-4">
                            <div className="flex-1 pl-2">
                                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mb-0.5 flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Confirmado
                                </p>
                                <p className="text-sm font-bold text-stone-800 line-clamp-1">
                                    {existingOrder.menu_items?.name || 'Prato Reservado'}
                                </p>
                            </div>
                            <Button
                                onClick={handleCancelOrder}
                                variant="ghost"
                                className="h-10 px-4 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 font-bold rounded-xl active:scale-95 transition-all text-xs"
                            >
                                Trocar
                            </Button>
                        </div>
                    </motion.div>
                ) : selectedId && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-24 left-4 right-4 z-40 flex justify-center"
                    >
                        <Button
                            onClick={handleConfirm}
                            disabled={submitting}
                            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl shadow-xl shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-between px-6"
                        >
                            <span>Confirmar Reserva</span>
                            {submitting ? <Loader2 className="animate-spin text-white/90" /> : <ArrowRight className="w-6 h-6 text-white/90" />}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default function SelectionPage() {
    return (
        <Suspense fallback={
            <div className="h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100 flex items-center justify-center">
                <Loader2 className="animate-spin text-emerald-600 w-8 h-8" />
            </div>
        }>
            <SelectionContent />
        </Suspense>
    )
}

