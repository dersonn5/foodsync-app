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

    const handleCheckIn = async () => {
        if (!existingOrder) return
        setSubmitting(true)
        try {
            const { data, error } = await supabase
                .from('orders')
                .update({ status: 'confirmed' })
                .eq('id', existingOrder.id)
                .select('*, menu_items(*)')
                .single()

            if (data) {
                setExistingOrder(data)
            } else if (error) {
                console.error(error)
                alert('Erro ao confirmar presença.')
            }
        } catch (err) {
            console.error('Check-in failed', err)
            alert('Erro ao confirmar presença.')
        } finally {
            setSubmitting(false)
        }
    }

    const filteredItems = activeTab === 'all'
        ? menuItems
        : menuItems.filter(i => i.type === activeTab)

    if (!user) return (
        <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
            <Loader2 className="animate-spin w-8 h-8" style={{ color: '#0F2A1D' }} />
        </div>
    )

    return (
        <div className="flex flex-col h-[100dvh] bg-transparent">

            {/* HEADER */}
            <header id="tour-emp-header" className="flex-none bg-white/80 backdrop-blur-xl shadow-sm z-20 relative border-b border-slate-200/60">
                {/* Top Brand Bar */}
                <div className="h-1 w-full" style={{ backgroundColor: '#0F2A1D' }} />

                {/* Profile & Greeting */}
                <div className="px-6 pt-8 pb-4 flex justify-between items-center">
                    <div>
                        <span className="text-sm font-medium" style={{ color: '#517252' }}>Bom almoço,</span>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2" style={{ color: '#0F2A1D' }}>
                            <div className="p-2 rounded-xl shadow-lg shadow-brand-900/10 mr-1" style={{ backgroundColor: '#0F2A1D' }}>
                                <ChefHat className="w-5 h-5 text-white" />
                            </div>
                            {user.name.split(' ')[0]}
                        </h1>
                    </div>

                    <SignOutButton />
                </div>

                {/* Calendar Pills */}
                <div id="tour-emp-calendar" className="pb-5 pl-6 overflow-x-auto hide-scrollbar flex gap-2 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {calendarDays.map((date) => {
                        const isSelected = isSameDay(date, selectedDate)

                        return (
                            <button
                                key={date.toISOString()}
                                onClick={() => handleDateChange(date)}
                                className={cn(
                                    "flex flex-col items-center justify-center min-w-[56px] h-[68px] rounded-2xl border transition-all duration-300 active:scale-95 flex-shrink-0",
                                    isSelected
                                        ? "border-transparent text-white shadow-lg shadow-brand-900/20"
                                        : "bg-white/60 backdrop-blur-xl border-slate-200/60 text-slate-500 hover:border-slate-300 hover:bg-white/80"
                                )}
                                style={isSelected ? { backgroundColor: '#0F2A1D' } : {}}
                            >
                                <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-widest mb-0.5",
                                    isSelected ? "text-white/70" : "text-slate-400"
                                )}>
                                    {format(date, 'EEE', { locale: ptBR }).replace('.', '')}
                                </span>
                                <span className={cn(
                                    "text-xl font-black",
                                    isSelected ? "text-white" : "text-slate-700"
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
                    <div id="tour-emp-filters" className="flex gap-2 overflow-x-auto hide-scrollbar -mx-6 px-6 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
                                        ? "text-white shadow-md border-transparent"
                                        : "bg-white/60 text-slate-600 border-slate-200/60 hover:bg-white hover:border-slate-300"
                                )}
                                style={activeTab === tab.id ? { backgroundColor: '#0F2A1D' } : {}}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Section Title */}
                    <div id="tour-emp-menu-title" className="flex items-center justify-between">
                        <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: '#0F2A1D' }}>
                            <div className="p-1.5 rounded-lg shadow-sm" style={{ backgroundColor: '#0F2A1D' }}>
                                <Utensils className="w-4 h-4 text-white" />
                            </div>
                            Cardápio do Dia
                        </h2>
                        <span className="text-xs font-bold text-brand-800 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-200">
                            {filteredItems.length} {filteredItems.length === 1 ? 'Opção' : 'Opções'}
                        </span>
                    </div>

                    {/* Menu Cards */}
                    <div id="tour-emp-menu-cards" className="space-y-4">
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
                                                "group bg-white/60 backdrop-blur-xl rounded-2xl p-4 border flex gap-4 active:scale-[0.98] transition-all duration-200 cursor-pointer",
                                                isSelected
                                                    ? "border-brand-700 ring-2 ring-brand-900/10 shadow-lg shadow-brand-900/10"
                                                    : "border-slate-200/60 hover:border-slate-300 hover:bg-white/80 hover:shadow-md"
                                            )}
                                            onClick={() => !existingOrder && setSelectedId(item.id)}
                                        >
                                            {/* Image */}
                                            <div
                                                className="h-28 w-28 flex-none rounded-xl bg-slate-100 bg-cover bg-center relative overflow-hidden"
                                                style={{ backgroundImage: item.photo_url ? `url(${item.photo_url})` : 'none' }}
                                            >
                                                {!item.photo_url && (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <Utensils className="w-8 h-8" />
                                                    </div>
                                                )}
                                                {isOrdered && (
                                                    <div className="absolute inset-0 bg-brand-900/30 flex items-center justify-center backdrop-blur-[2px]">
                                                        <div className="w-10 h-10 rounded-full bg-brand-800 flex items-center justify-center shadow-md">
                                                            <Check className="text-white w-6 h-6" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col justify-between flex-1 py-1">
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                        {item.type === 'main' ? 'Padrão' : item.type}
                                                    </span>
                                                    <h3 className="font-bold leading-tight mt-1 text-lg line-clamp-2" style={{ color: '#0F2A1D' }}>
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-xs mt-1 line-clamp-2" style={{ color: '#517252' }}>
                                                        {item.description || "Sem descrição disponível."}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs font-medium text-slate-400">
                                                        450kcal
                                                    </span>
                                                    <button
                                                        className={cn(
                                                            "h-9 w-9 rounded-xl flex items-center justify-center transition-all",
                                                            isSelected
                                                                ? "text-white shadow-lg shadow-brand-900/20"
                                                                : "bg-white text-slate-500 hover:bg-brand-50 hover:text-brand-800 border border-slate-200/60"
                                                        )}
                                                        style={isSelected ? { backgroundColor: '#0F2A1D' } : {}}
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
                                    <div className="w-20 h-20 bg-slate-100/80 rounded-2xl flex items-center justify-center mb-4 border border-slate-200/60">
                                        <CalendarX className="text-slate-400 w-10 h-10" />
                                    </div>
                                    <h3 className="font-bold mb-1" style={{ color: '#0F2A1D' }}>Nenhum prato disponível</h3>
                                    <p className="text-sm max-w-[200px]" style={{ color: '#517252' }}>O cardápio para esta data ainda não foi publicado.</p>
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
                        className="fixed bottom-24 left-4 right-4 z-40 flex flex-col gap-2"
                    >
                        {existingOrder.status === 'pending' && isSameDay(selectedDate, startOfToday()) ? (
                            <div className="w-full bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-amber-200/60 flex flex-col gap-3">
                                <div>
                                    <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest mb-0.5 flex items-center gap-1">
                                        <Loader2 className="w-3 h-3 text-amber-500 animate-spin" /> Check-in Pendente
                                    </p>
                                    <p className="text-sm font-bold line-clamp-1" style={{ color: '#0F2A1D' }}>
                                        {existingOrder.menu_items?.name || 'Prato Reservado'}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleCheckIn}
                                        disabled={submitting}
                                        className="flex-1 h-12 text-sm font-bold text-white rounded-xl shadow-lg active:scale-95 transition-all bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        {submitting ? <Loader2 className="animate-spin text-white w-5 h-5 mx-auto" /> : 'Confirmar Presença Hoje'}
                                    </Button>
                                    <Button
                                        onClick={handleCancelOrder}
                                        variant="ghost"
                                        className="h-12 px-4 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 font-bold rounded-xl active:scale-95 transition-all text-xs"
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-slate-200/60 flex items-center justify-between gap-4">
                                <div className="flex-1 pl-2">
                                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mb-0.5 flex items-center gap-1">
                                        <Check className="w-3 h-3 text-emerald-600" /> {existingOrder.status === 'confirmed' ? 'Presença Confirmada' : 'Reserva Feita'}
                                    </p>
                                    <p className="text-sm font-bold line-clamp-1" style={{ color: '#0F2A1D' }}>
                                        {existingOrder.menu_items?.name || 'Prato Reservado'}
                                    </p>
                                    {existingOrder.status === 'pending' && (
                                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                                            Lembre-se de confirmar no dia {format(selectedDate, 'dd/MM')}.
                                        </p>
                                    )}
                                </div>
                                <Button
                                    onClick={handleCancelOrder}
                                    variant="ghost"
                                    className="h-10 px-4 bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200 font-bold rounded-xl active:scale-95 transition-all text-xs"
                                >
                                    Trocar
                                </Button>
                            </div>
                        )}
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
                            className="w-full h-14 text-lg font-bold text-white rounded-2xl shadow-xl shadow-brand-900/30 active:scale-95 transition-all flex items-center justify-between px-6 hover:bg-brand-900"
                            style={{ backgroundColor: '#0F2A1D' }}
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
            <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
                <Loader2 className="animate-spin w-8 h-8" style={{ color: '#0F2A1D' }} />
            </div>
        }>
            <SelectionContent />
        </Suspense>
    )
}

