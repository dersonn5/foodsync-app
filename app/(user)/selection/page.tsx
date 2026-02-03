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

    if (!user) return <div className="h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

    return (
        <div className="flex flex-col h-[100dvh] bg-background">

            {/* BLOCO 1: HEADER FIXO */}
            <header className="flex-none bg-card shadow-sm z-20 relative border-b border-border">
                {/* Top Gradient Bar */}
                <div className="h-1 w-full" style={{ background: 'var(--gradient-brand)' }} />

                {/* Perfil & Saudação */}
                <div className="px-6 pt-8 pb-4 flex justify-between items-center">
                    <div>
                        <span className="text-sm text-muted-foreground font-medium">Bom almoço,</span>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
                            {user.name.split(' ')[0]}
                            <span className="text-xl">👋</span>
                        </h1>
                    </div>

                    <div className="text-muted-foreground">
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
                                        ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/25"
                                        : "bg-card border-border text-muted-foreground hover:border-primary/30"
                                )}
                            >
                                <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-widest mb-1",
                                    isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                                )}>
                                    {format(date, 'EEE', { locale: ptBR }).replace('.', '')}
                                </span>
                                <span className={cn(
                                    "text-xl font-black",
                                    isSelected ? "text-primary-foreground" : "text-foreground"
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
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                        : "bg-card text-muted-foreground border border-border hover:bg-muted"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Título da Seção */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <ChefHat className="w-5 h-5 text-primary" />
                            Cardápio do Dia
                        </h2>
                        <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                            {filteredItems.length} {filteredItems.length === 1 ? 'Opção' : 'Opções'}
                        </span>
                    </div>

                    {/* Lista de Cards */}
                    <div className="space-y-5">
                        <AnimatePresence mode="wait">
                            {loadingMenu ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-32 bg-card rounded-[2rem] animate-pulse shadow-sm" />
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
                                                "group bg-card rounded-[2rem] p-4 shadow-sm border flex gap-4 active:scale-[0.98] transition-all duration-200",
                                                isSelected ? "border-primary ring-1 ring-primary shadow-md" : "border-border"
                                            )}
                                            onClick={() => !existingOrder && setSelectedId(item.id)}
                                        >
                                            {/* Imagem */}
                                            <div
                                                className="h-28 w-28 flex-none rounded-2xl bg-muted bg-cover bg-center shadow-inner relative overflow-hidden"
                                                style={{ backgroundImage: item.photo_url ? `url(${item.photo_url})` : 'none' }}
                                            >
                                                {!item.photo_url && (
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
                                                        <Utensils className="w-8 h-8" />
                                                    </div>
                                                )}
                                                {isOrdered && (
                                                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[1px]">
                                                        <Check className="text-white w-8 h-8 drop-shadow-md" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col justify-between flex-1 py-1">
                                                <div>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                        {item.type === 'main' ? 'Padrão' : item.type}
                                                    </span>
                                                    <h3 className="font-bold text-foreground leading-tight mt-1 text-lg line-clamp-2">
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                        {item.description || "Sem descrição disponível."}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs font-medium text-muted-foreground">
                                                        450kcal
                                                    </span>
                                                    <button
                                                        className={cn(
                                                            "h-8 w-8 rounded-full flex items-center justify-center transition-colors",
                                                            isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-primary hover:bg-primary hover:text-primary-foreground"
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
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                        <CalendarX className="text-muted-foreground w-8 h-8" />
                                    </div>
                                    <p className="text-muted-foreground text-sm">Nenhum prato disponível para esta data.</p>
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
                        <div className="w-full bg-card/95 backdrop-blur-xl p-4 rounded-xl shadow-xl border border-border flex items-center justify-between gap-4">
                            <div className="flex-1 pl-2">
                                <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-0.5 flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Confirmado
                                </p>
                                <p className="text-sm font-bold text-foreground line-clamp-1">
                                    {existingOrder.menu_items?.name || 'Prato Reservado'}
                                </p>
                            </div>
                            <Button
                                onClick={handleCancelOrder}
                                variant="destructive"
                                className="h-10 px-4 bg-destructive/10 text-destructive hover:bg-destructive/20 border-0 font-bold rounded-lg active:scale-95 transition-all shadow-none text-xs"
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
                            className="w-full h-14 text-lg font-bold bg-primary hover:brightness-110 text-primary-foreground rounded-xl shadow-lg shadow-primary/30 active:scale-95 transition-all flex items-center justify-between px-6"
                        >
                            <span>Confirmar Reserva</span>
                            {submitting ? <Loader2 className="animate-spin text-primary-foreground/90" /> : <ArrowRight className="w-6 h-6 text-primary-foreground/90" />}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default function SelectionPage() {
    return (
        <Suspense fallback={<div className="h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
            <SelectionContent />
        </Suspense>
    )
}
