'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { MenuItem } from '@/types'
import { Button } from '@/components/ui/button'
import { Check, Utensils, Loader2, ArrowRight, CalendarX, Plus, LogOut } from 'lucide-react'
import { format, startOfToday, parseISO, isValid, addDays, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { sendConfirmationMessage } from '@/app/actions/whatsapp'
import SignOutButton from '@/components/SignOutButton'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
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
        const stored = localStorage.getItem('foodsync_user')
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

    if (!user) return <div className="h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-green-600" /></div>

    return (
        <div className="flex flex-col h-[100dvh] bg-slate-50">

            {/* BLOCO 1: HEADER FIXO */}
            <header className="flex-none bg-white shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)] z-20 relative">
                {/* Perfil & Saudação */}
                <div className="px-6 pt-12 pb-4 flex justify-between items-center">
                    <div>
                        <span className="text-sm text-slate-400 font-medium">Bom almoço,</span>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{user.name.split(' ')[0]} 👋</h1>
                    </div>

                    <div className="text-slate-400">
                        <SignOutButton />
                    </div>
                </div>

                {/* Calendário (Cápsulas Modernas) */}
                <div className="pb-6 pl-6 overflow-x-auto hide-scrollbar flex gap-3 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {calendarDays.map((date) => {
                        const isSelected = isSameDay(date, selectedDate)

                        return (
                            <button
                                key={date.toISOString()}
                                onClick={() => handleDateChange(date)}
                                className={cn(
                                    "flex flex-col items-center justify-center min-w-[60px] h-[72px] rounded-2xl border transition-all duration-300 active:scale-95 flex-shrink-0",
                                    isSelected
                                        ? "bg-slate-800 border-slate-800 text-white shadow-lg shadow-slate-900/20"
                                        : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                                )}
                            >
                                <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-widest mb-1",
                                    isSelected ? "text-slate-400" : "text-slate-400"
                                )}>
                                    {format(date, 'EEE', { locale: ptBR }).replace('.', '')}
                                </span>
                                <span className={cn(
                                    "text-xl font-black",
                                    isSelected ? "text-white" : "text-slate-800"
                                )}>
                                    {format(date, 'd')}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </header>

            {/* BLOCO 2: CORPO COM SCROLL */}
            <main className="flex-1 overflow-y-auto scroll-smooth">
                <div className="px-6 py-6 pb-32 space-y-8">

                    {/* Filtros (Chips) */}
                    <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-6 px-6 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
                                    "px-6 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all flex-shrink-0",
                                    activeTab === tab.id
                                        ? "bg-slate-800 text-white shadow-lg shadow-slate-200"
                                        : "bg-white text-slate-600 border border-slate-100 hover:bg-slate-50"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Título da Seção */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-800">Cardápio do Dia</h2>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                            {filteredItems.length} {filteredItems.length === 1 ? 'Opção' : 'Opções'}
                        </span>
                    </div>

                    {/* Lista de Cards */}
                    <div className="space-y-5">
                        <AnimatePresence mode="wait">
                            {loadingMenu ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-32 bg-white rounded-[2rem] animate-pulse shadow-sm" />
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
                                                "group bg-white rounded-[2rem] p-4 shadow-sm border flex gap-4 active:scale-[0.98] transition-all duration-200",
                                                isSelected ? "border-green-500 ring-1 ring-green-500 shadow-md" : "border-slate-100/50"
                                            )}
                                            onClick={() => !existingOrder && setSelectedId(item.id)}
                                        >
                                            {/* Imagem */}
                                            <div
                                                className="h-28 w-28 flex-none rounded-2xl bg-slate-100 bg-cover bg-center shadow-inner relative overflow-hidden"
                                                style={{ backgroundImage: item.photo_url ? `url(${item.photo_url})` : 'none' }}
                                            >
                                                {!item.photo_url && (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <Utensils className="w-8 h-8" />
                                                    </div>
                                                )}
                                                {isOrdered && (
                                                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center backdrop-blur-[1px]">
                                                        <Check className="text-white w-8 h-8 drop-shadow-md" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col justify-between flex-1 py-1">
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                        {item.type === 'main' ? 'Padrão' : item.type}
                                                    </span>
                                                    <h3 className="font-bold text-slate-800 leading-tight mt-1 text-lg line-clamp-2">
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                                        {item.description || "Sem descrição disponível."}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs font-medium text-slate-400">
                                                        450kcal
                                                    </span>
                                                    <button
                                                        className={cn(
                                                            "h-8 w-8 rounded-full flex items-center justify-center transition-colors",
                                                            isSelected ? "bg-green-500 text-white" : "bg-slate-50 text-green-600 hover:bg-green-500 hover:text-white"
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
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                        <CalendarX className="text-slate-400 w-8 h-8" />
                                    </div>
                                    <p className="text-slate-500 text-sm">Nenhum prato disponível para esta data.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </main>

            {/* Floating Action Button for Confirmation */}
            <AnimatePresence>
                {existingOrder ? (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-24 left-4 right-4 z-40 flex justify-center"
                    >
                        <div className="w-full bg-white/95 backdrop-blur-xl p-4 rounded-xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-200/50 flex items-center justify-between gap-4 ring-1 ring-black/5">
                            <div className="flex-1 pl-2">
                                <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest mb-0.5 flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Confirmado
                                </p>
                                <p className="text-sm font-bold text-gray-900 line-clamp-1">
                                    {existingOrder.menu_items?.name || 'Prato Reservado'}
                                </p>
                            </div>
                            <Button
                                onClick={handleCancelOrder}
                                variant="destructive"
                                className="h-10 px-4 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-0 font-bold rounded-lg active:scale-95 transition-all shadow-none text-xs"
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
                            className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-between px-6"
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
        <Suspense fallback={<div className="h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-green-600" /></div>}>
            <SelectionContent />
        </Suspense>
    )
}
