'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { MenuItem } from '@/types'
import { Button } from '@/components/ui/button'
import { Check, Utensils, Clock, Loader2, ArrowRight, CalendarX } from 'lucide-react'
import { format, startOfToday, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { sendConfirmationMessage } from '@/app/actions/whatsapp'
import SignOutButton from '@/components/SignOutButton'
import DateStrip from '@/components/DateStrip'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

// Helper to standardise date string for DB (YYYY-MM-DD)
const getDateStr = (date: Date) => format(date, 'yyyy-MM-dd')

function SelectionContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Auth State
    const [user, setUser] = useState<any>(null)

    // Date State - synced with URL or default to Today
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
                    .eq('date', dateStr) // Filter by specific date
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
                    // Fire and forget whatsapp
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

    // Filtering logic (Client side for category)
    const filteredItems = activeTab === 'all'
        ? menuItems
        : menuItems.filter(i => i.type === activeTab)

    if (!user) return <div className="h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-green-600" /></div>

    return (
        <div className="min-h-screen bg-slate-50 pb-32 font-sans selection:bg-green-100">
            {/* 1. Elite Header */}
            <header className="bg-white/80 backdrop-blur-xl px-6 pt-14 pb-4 sticky top-0 z-30 shadow-[0_4px_30px_-5px_rgba(0,0,0,0.03)] border-b border-gray-100/50">
                <div className="flex justify-between items-start mb-6">
                    <div className="animate-in slide-in-from-left-2 duration-500">
                        <p className="text-sm text-gray-400 font-medium">Olá, <span className="text-green-600 font-bold text-base tracking-tight">{user.name.split(' ')[0]}</span></p>
                        <h1 className="text-2xl font-bold text-gray-900 mt-0.5 tracking-tight leading-tight">O que vamos comer?</h1>
                        {existingOrder && (
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-green-700 font-bold bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-green-100">
                                    <Check className="w-3 h-3" />
                                    Pedido Confirmado
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-11 w-11 bg-white rounded-full flex items-center justify-center text-green-700 font-bold shadow-md shadow-gray-200 ring-2 ring-gray-50">
                            {user.name.charAt(0)}
                        </div>
                        <SignOutButton />
                    </div>
                </div>

                {/* Date Strip */}
                <div className="-mx-1">
                    <DateStrip selectedDate={selectedDate} onSelectDate={handleDateChange} />
                </div>
            </header>

            {/* 2. Category Tabs */}
            <div className="sticky top-[240px] z-20 bg-slate-50/95 backdrop-blur-sm py-4 px-6">
                <div className="flex justify-start items-center w-full gap-2 overflow-x-auto scrollbar-hide">
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
                                flex-shrink-0 px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-300
                                ${activeTab === tab.id
                                    ? 'bg-gray-900 text-white shadow-lg shadow-gray-200 scale-100 ring-2 ring-white'
                                    : 'bg-white text-gray-400 hover:bg-gray-50 border border-transparent shadow-sm'
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. Meal Cards Grid */}
            <main className="px-5 space-y-5 min-h-[50vh]">
                <AnimatePresence mode="wait">
                    {loadingMenu ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-36 bg-white rounded-3xl animate-pulse shadow-sm" />
                            ))}
                        </motion.div>
                    ) : filteredItems.length > 0 ? (
                        <div className="space-y-5 pb-20">
                            {filteredItems.map((item, index) => {
                                const isSelected = selectedId === item.id
                                const isOrdered = existingOrder?.menu_item_id === item.id
                                return (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05, duration: 0.4 }}
                                        key={item.id}
                                        onClick={() => !existingOrder && setSelectedId(item.id)}
                                        className={`
                                            group relative overflow-hidden rounded-[2rem] bg-white p-3 shadow-[0_2px_15px_-4px_rgba(0,0,0,0.05)] border transition-all duration-300 w-full
                                            ${isSelected
                                                ? 'border-green-500/50 shadow-[0_10px_40px_-10px_rgba(22,163,74,0.15)] ring-1 ring-green-500/20'
                                                : existingOrder
                                                    ? isOrdered ? 'border-green-500 ring-2 ring-green-100 opacity-100' : 'opacity-50 grayscale-[0.5]'
                                                    : 'border-white hover:border-gray-100 hover:shadow-lg cursor-pointer'
                                            }
                                        `}
                                    >
                                        <div className="flex gap-4">
                                            {/* Image with zoom effect */}
                                            <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-inner relative flex-shrink-0 bg-gray-50">
                                                {item.photo_url ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                                        <Utensils className="w-8 h-8" />
                                                    </div>
                                                )}
                                                {/* Selected overlay */}
                                                <div className={`absolute inset-0 bg-green-900/10 backdrop-blur-[1px] transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 flex flex-col justify-center py-1 pr-2">
                                                <div className="flex justify-between items-start">
                                                    <Badge variant="secondary" className="mb-2 text-[10px] font-bold uppercase tracking-wider bg-gray-50 text-gray-500 border border-gray-100">
                                                        {item.type === 'main' ? 'Padrão' : item.type}
                                                    </Badge>
                                                    {isOrdered && (
                                                        <Badge className="bg-green-100 text-green-700 border-green-200">Escolhido</Badge>
                                                    )}
                                                </div>
                                                <h3 className={`font-bold text-lg leading-tight mb-2 tracking-tight transition-colors ${isSelected ? 'text-green-700' : 'text-gray-900'}`}>
                                                    {item.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed font-medium">
                                                    {item.description || "Uma opção deliciosa preparada pelos nossos chefs."}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Check Icon ABSOLUTE */}
                                        <AnimatePresence>
                                            {isSelected && (
                                                <motion.div
                                                    initial={{ scale: 0, rotate: -45 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    exit={{ scale: 0 }}
                                                    className="absolute top-3 right-3 bg-green-500 text-white p-2 rounded-full shadow-lg shadow-green-500/30"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in zoom-in duration-500">
                            <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                                <CalendarX className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Cardápio Indefinido</h3>
                            <p className="text-gray-500 max-w-xs mx-auto leading-relaxed">
                                Ainda não temos pratos cadastrados para <br />
                                <span className="font-bold text-gray-700">{format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}</span>.
                            </p>
                            <Button
                                variant="outline"
                                className="mt-8 rounded-xl"
                                onClick={() => handleDateChange(startOfToday())}
                            >
                                Voltar para Hoje
                            </Button>
                        </div>
                    )}
                </AnimatePresence>
            </main>

            {/* Confirm Floating Button */}
            <AnimatePresence>
                {existingOrder ? (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-[40px] left-0 right-0 px-6 z-40 flex justify-center"
                    >
                        <div className="w-full max-w-md bg-white/95 backdrop-blur-xl p-4 rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-200/50 flex items-center justify-between gap-4 ring-1 ring-black/5">
                            <div className="flex-1 pl-2">
                                <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest mb-0.5 flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Confirmado para {format(selectedDate, 'dd/MM')}
                                </p>
                                <p className="text-sm font-bold text-gray-900 line-clamp-1">
                                    {existingOrder.menu_items?.name || 'Prato Reservado'}
                                </p>
                            </div>
                            {/* Allow cancel only if future or today? Logic can be refined */}
                            <Button
                                onClick={handleCancelOrder}
                                variant="destructive"
                                className="h-11 px-5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-0 font-bold rounded-xl active:scale-95 transition-all shadow-none"
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
                        className="fixed bottom-[40px] left-0 right-0 px-6 z-40 flex justify-center"
                    >
                        <Button
                            onClick={handleConfirm}
                            disabled={submitting}
                            className="w-full max-w-md h-16 text-lg font-bold bg-green-600 hover:bg-green-700 text-white rounded-[2rem] shadow-[0_20px_40px_-12px_rgba(22,163,74,0.5)] active:scale-95 transition-all flex items-center justify-between px-8 border-t border-white/20"
                        >
                            <span>Reservar este Prato</span>
                            {submitting ? <Loader2 className="animate-spin text-white/90" /> : <ArrowRight className="w-6 h-6 text-white/90" />}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Wrap in Suspense boundary for useSearchParams
export default function SelectionPage() {
    return (
        <Suspense fallback={<div className="h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-green-600" /></div>}>
            <SelectionContent />
        </Suspense>
    )
}
