'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { MenuItem } from '@/types'
import { Button } from '@/components/ui/button'
import { Check, Utensils, Clock, Loader2, ArrowRight } from 'lucide-react'
import { format, addDays, startOfToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { sendConfirmationMessage } from '@/app/actions/whatsapp'
import SignOutButton from '@/components/SignOutButton'
import DateStrip from '@/components/DateStrip'
import { motion, AnimatePresence } from 'framer-motion'

// Helper to standardise date string for DB (YYYY-MM-DD)
const getDateStr = (date: Date) => date.toISOString().split('T')[0]

export default function SelectionPage() {
    const [user, setUser] = useState<any>(null)
    const router = useRouter()

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

    // 3. Fetch Menu Items
    useEffect(() => {
        if (!user) return

        async function fetchMenu() {
            setLoadingMenu(true)
            try {
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
    }, [user])

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

    // --- VIEW: MENU SELECTION ---
    return (
        <div className="min-h-screen bg-slate-50 pb-32 font-sans selection:bg-green-100">
            {/* 1. Elite Header */}
            <header className="bg-white/80 backdrop-blur-xl px-6 pt-14 pb-4 sticky top-0 z-30 shadow-[0_4px_30px_-5px_rgba(0,0,0,0.03)] border-b border-gray-100/50">
                <div className="flex justify-between items-start mb-6">
                    <div className="animate-in slide-in-from-left-2 duration-500">
                        <p className="text-sm text-gray-400 font-medium">Olá, <span className="text-green-600 font-bold text-base tracking-tight">{user.name.split(' ')[0]}</span></p>
                        <h1 className="text-2xl font-bold text-gray-900 mt-0.5 tracking-tight leading-tight">O que vamos comer?</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                                <Clock className="w-3 h-3" />
                                Planejamento
                            </span>
                        </div>
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
                    <DateStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />
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
                        <div className="space-y-5">
                            {filteredItems.map((item, index) => {
                                const isSelected = selectedId === item.id
                                return (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05, duration: 0.4 }}
                                        key={item.id}
                                        onClick={() => setSelectedId(item.id)}
                                        className={`
                                            group relative overflow-hidden rounded-[2rem] bg-white p-3 shadow-[0_2px_15px_-4px_rgba(0,0,0,0.05)] border transition-all duration-300 cursor-pointer w-full
                                            ${isSelected
                                                ? 'border-green-500/50 shadow-[0_10px_40px_-10px_rgba(22,163,74,0.15)] ring-1 ring-green-500/20'
                                                : 'border-white hover:border-gray-100 hover:shadow-lg'
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
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={`https://source.unsplash.com/200x200/?${item.type === 'fit' ? 'salad' : 'lunch'},food`}
                                                        alt="Food"
                                                        className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                )}
                                                {/* Selected overlay */}
                                                <div className={`absolute inset-0 bg-green-900/10 backdrop-blur-[1px] transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 flex flex-col justify-center py-1 pr-2">
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
                        <div className="text-center py-20 opacity-60 flex flex-col items-center">
                            <div className="bg-white p-6 rounded-full mb-4 shadow-sm">
                                <Utensils className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="font-bold text-gray-700 text-lg">Cardápio Vazio</h3>
                            <p className="max-w-[200px] text-sm mt-1 text-gray-400">Nenhuma opção disponível para esta categoria.</p>
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
                        className="fixed bottom-[110px] left-0 right-0 px-6 z-40 flex justify-center"
                    >
                        <div className="w-full max-w-md bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 flex items-center justify-between gap-4">
                            <div className="flex-1 pl-2">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Pedido Confirmado</p>
                                <p className="text-sm font-bold text-gray-900 line-clamp-1">
                                    {existingOrder.menu_items?.name || 'Prato Reservado'}
                                </p>
                            </div>
                            <Button
                                onClick={handleCancelOrder}
                                variant="destructive"
                                className="h-12 px-6 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-0 font-bold rounded-2xl active:scale-95 transition-all shadow-none"
                            >
                                Cancelar
                            </Button>
                        </div>
                    </motion.div>
                ) : selectedId && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-[110px] left-0 right-0 px-6 z-40 flex justify-center"
                    >
                        <Button
                            onClick={handleConfirm}
                            disabled={submitting}
                            className="w-full max-w-md h-16 text-lg font-bold bg-green-600 hover:bg-green-700 text-white rounded-3xl shadow-[0_8px_30px_rgb(22,163,74,0.35)] active:scale-95 transition-all flex items-center justify-between px-8 border-t border-white/20"
                        >
                            <span>Reservar Prato</span>
                            {submitting ? <Loader2 className="animate-spin text-white/90" /> : <ArrowRight className="w-6 h-6 text-white/90" />}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
