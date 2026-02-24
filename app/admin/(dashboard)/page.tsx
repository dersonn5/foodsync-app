'use client'

import { useEffect, useState, Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
    Utensils,
    TrendingUp,
    Ban,
    Clock,
    ShoppingBag,
    ArrowUpRight,
    Coffee,
    CalendarOff,
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    AlertCircle,
    ChefHat,
    ListChecks,
    Printer
} from 'lucide-react'
import { format, subDays, addDays, parseISO } from 'date-fns'
import { Toaster } from 'sonner'
import { formatDateDisplay } from '@/lib/utils'
import { SatisfactionWidgetCompact } from '@/components/feedback/SatisfactionWidgetCompact'

export default function AdminPageWrapper() {
    return (
        <Suspense fallback={<div className="p-8">Carregando dashboard...</div>}>
            <AdminPageContent />
        </Suspense>
    )
}

function AdminPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()
    const [user, setUser] = useState<any>(null)

    // Independent Loading States
    const [loadingKPIs, setLoadingKPIs] = useState(true)
    const [loadingFeed, setLoadingFeed] = useState(true)

    // Independent Error States
    const [errorKPIs, setErrorKPIs] = useState<string | null>(null)
    const [errorFeed, setErrorFeed] = useState<string | null>(null)

    // Data States
    const [stats, setStats] = useState({ total_today: 0, canceled_today: 0, pending_today: 0 })
    const [recentOrders, setRecentOrders] = useState<any[]>([])

    const dateParam = searchParams.get('date')
    const currentDateStr = dateParam || format(new Date(), 'yyyy-MM-dd')

    // 1. Auth Check
    useEffect(() => {
        async function checkAuth() {
            const { data: { user }, error } = await supabase.auth.getUser()
            if (error || !user) {
                router.push('/admin/login')
                return
            }
            setUser({ ...user, name: user.user_metadata?.name || 'Administrador' })

            // Trigger Isolated Fetches
            fetchKPIs(currentDateStr)
            fetchFeed(currentDateStr)
        }
        checkAuth()
    }, [currentDateStr])

    // --- Isolated Fetch Functions ---

    /**
     * 1. KPIs Fetch (Critical)
     */
    async function fetchKPIs(date: string) {
        setLoadingKPIs(true)
        setErrorKPIs(null)
        try {
            console.log("📊 Fetching KPIs for:", date)
            const { data, error } = await supabase
                .from('orders')
                .select('id, status, consumption_date')
                .eq('consumption_date', date)

            if (error) throw error

            // Robust Counting Logic (Fix for status variations)
            const rows = data || []

            const canceledCount = rows.filter((o: any) => {
                const s = (o.status || '').toLowerCase().trim()
                return s === 'cancelled' || s === 'canceled'
            }).length

            const pendingCount = rows.filter((o: any) => {
                const s = (o.status || '').toLowerCase().trim()
                return s === 'pending'
            }).length

            const totalCount = rows.length

            setStats({
                total_today: totalCount,
                canceled_today: canceledCount,
                pending_today: pendingCount
            })
        } catch (err: any) {
            console.error("❌ Erro KPI:", err.message)
            setErrorKPIs("Erro ao carregar totais")
        } finally {
            setLoadingKPIs(false)
        }
    }

    /**
     * 2. Feed Fetch (High Risk)
     */
    async function fetchFeed(date: string) {
        setLoadingFeed(true)
        setErrorFeed(null)
        try {
            console.log("🥘 Fetching Feed for:", date)
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id, 
                    created_at, 
                    status, 
                    consumption_date,
                    users (name, phone),
                    menu_items (name) 
                `)
                .eq('consumption_date', date)
                .order('id', { ascending: false }) // Ambiguity Fix

            if (error) throw error

            setRecentOrders(data || [])
        } catch (err: any) {
            console.error("❌ Erro Feed:", err.message)
            setErrorFeed("Falha ao carregar lista de pedidos")
        } finally {
            setLoadingFeed(false)
        }
    }

    // --- Derived State: Production Breakdown ---
    const productionList = useMemo(() => {
        const activeOrders = recentOrders.filter(o => {
            const s = (o.status || '').toLowerCase()
            return s !== 'cancelled' && s !== 'canceled'
        })

        const counts: Record<string, number> = {}

        activeOrders.forEach(order => {
            const dishName = order.menu_items?.name || 'Item Desconhecido'
            counts[dishName] = (counts[dishName] || 0) + 1
        })

        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
    }, [recentOrders])

    const totalProduction = productionList.reduce((acc, item) => acc + item.count, 0)


    // Navigation Handlers
    const handlePrevDay = () => router.push(`/admin?date=${format(subDays(parseISO(currentDateStr), 1), 'yyyy-MM-dd')}`)
    const handleNextDay = () => router.push(`/admin?date=${format(addDays(parseISO(currentDateStr), 1), 'yyyy-MM-dd')}`)
    const handleToday = () => router.push('/admin')

    // Export orders to CSV for contingency printing
    const exportToCSV = () => {
        if (recentOrders.length === 0) {
            alert('Não há pedidos para exportar.')
            return
        }

        // CSV Header
        const headers = ['Nome', 'Setor', 'Prato', 'Status', 'Data']

        // CSV Rows with correct field mapping
        const rows = recentOrders.map(order => {
            const nome = order.users?.name || 'Desconhecido'
            const setor = order.users?.department || 'Geral'
            const prato = order.menu_items?.name || 'N/A'
            const status = (order.status || '').toLowerCase()
            const statusText = status === 'confirmed' ? 'Confirmado' :
                status === 'pending' ? 'Pendente' :
                    (status === 'cancelled' || status === 'canceled') ? 'Cancelado' : 'Desconhecido'
            const data = order.consumption_date
                ? new Date(order.consumption_date + 'T12:00:00').toLocaleDateString('pt-BR')
                : 'N/A'

            return [nome, setor, prato, statusText, data]
        })

        // Build CSV content with BOM for Excel compatibility
        const csvContent = [
            headers.join(';'),
            ...rows.map(row => row.join(';'))
        ].join('\n')

        // Create blob and download (\uFEFF is BOM for UTF-8)
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', `pedidos_contingencia_${currentDateStr}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    if (!user) return null

    return (
        // Main Container with premium gradient
        <div className="flex flex-col h-auto gap-6 p-4 md:p-8 overflow-visible md:h-full md:overflow-hidden bg-transparent relative z-10">
            <Toaster position="top-right" richColors />

            {/* Header Section - Premium Styling */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 shrink-0">
                <div className="flex flex-wrap items-center gap-4 md:gap-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3" style={{ color: '#0F2A1D' }}>
                            <div className="p-2 rounded-xl shadow-lg" style={{ backgroundColor: '#0F2A1D' }}>
                                <ShoppingBag className="w-6 h-6 text-white" />
                            </div>
                            Cockpit Operacional
                        </h1>
                        <p className="text-sm mt-1.5 ml-[52px]" style={{ color: '#517252' }}>
                            Visão do dia <span className="font-semibold capitalize" style={{ color: '#0F2A1D' }}>{formatDateDisplay(currentDateStr)}</span>
                        </p>
                    </div>

                    {/* Date Navigation - Glassmorphism */}
                    <div className="bg-white/60 backdrop-blur-xl shadow-sm border border-slate-200/60 rounded-2xl px-3 py-2 flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handlePrevDay}
                            className="h-8 w-8 hover:bg-brand-50 text-brand-600 hover:text-brand-900 rounded-xl transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>

                        <div className="flex items-center gap-2 px-3 font-medium text-brand-900 min-w-[120px] justify-center">
                            <CalendarIcon className="w-4 h-4 text-brand-700" />
                            <span className="capitalize text-sm">{formatDateDisplay(currentDateStr)}</span>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleNextDay}
                            className="h-8 w-8 hover:bg-brand-50 text-brand-600 hover:text-brand-900 rounded-xl transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>

                        {dateParam && (
                            <button
                                onClick={handleToday}
                                className="px-3 py-1 text-xs text-brand-800 hover:bg-brand-50 rounded-lg font-semibold transition-colors"
                            >
                                Hoje
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                    {/* Export Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={exportToCSV}
                        className="h-9 text-xs text-brand-600 hover:text-brand-900 hover:bg-brand-50 border-brand-100 rounded-xl transition-all"
                        disabled={loadingFeed || recentOrders.length === 0}
                    >
                        <Printer className="w-4 h-4 mr-2" />
                        Baixar Lista
                    </Button>
                    <div className="flex gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${loadingKPIs ? 'bg-amber-400 animate-pulse' : errorKPIs ? 'bg-red-500' : 'bg-brand-600'}`} title="Status KPIs" />
                        <div className={`w-2 h-2 rounded-full ${loadingFeed ? 'bg-amber-400 animate-pulse' : errorFeed ? 'bg-red-500' : 'bg-brand-600'}`} title="Status Feed" />
                    </div>
                </div>
            </div>

            {/* KPI Cards - Premium Design */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
                {/* Total Orders */}
                <Card className="border border-slate-200/60 shadow-sm bg-white/60 backdrop-blur-xl hover:shadow-md hover:bg-white/70 transition-all overflow-hidden rounded-2xl">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-brand-600 uppercase tracking-wider mb-1">Total de Pedidos</p>
                            {loadingKPIs ? (
                                <div className="h-9 w-16 bg-slate-200/50 animate-pulse rounded-lg" />
                            ) : (
                                <h3 className="text-4xl font-bold text-brand-900 tracking-tight">{stats.total_today}</h3>
                            )}
                        </div>
                        <div className="p-3 bg-gradient-to-br from-brand-800 to-brand-700 rounded-xl shadow-md shadow-brand-900/20">
                            <ShoppingBag className="w-6 h-6 text-white" />
                        </div>
                    </CardContent>
                </Card>

                {/* Cancellations */}
                <Card className="border border-slate-200/60 shadow-sm bg-white/60 backdrop-blur-xl hover:shadow-md hover:bg-white/70 transition-all overflow-hidden rounded-2xl">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-brand-600 uppercase tracking-wider mb-1">Cancelamentos</p>
                            {loadingKPIs ? (
                                <div className="h-9 w-16 bg-slate-200/50 animate-pulse rounded-lg" />
                            ) : (
                                <h3 className="text-4xl font-bold text-brand-900 tracking-tight">{stats.canceled_today}</h3>
                            )}
                        </div>
                        <div className="p-3 bg-red-50/80 rounded-xl">
                            <Ban className="w-6 h-6 text-red-500" />
                        </div>
                    </CardContent>
                </Card>

                {/* Pending Queue */}
                <Card className={`border shadow-sm transition-all overflow-hidden rounded-2xl ${stats.pending_today > 0
                    ? 'bg-amber-50/60 backdrop-blur-xl border-amber-200/60 shadow-amber-500/10'
                    : 'bg-white/60 backdrop-blur-xl border-slate-200/60 hover:bg-white/70 hover:shadow-md'
                    }`}>
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${stats.pending_today > 0 ? 'text-amber-700' : 'text-brand-600'}`}>
                                Fila Pendente
                            </p>
                            {loadingKPIs ? (
                                <div className="h-9 w-16 bg-slate-200/50 animate-pulse rounded-lg" />
                            ) : (
                                <h3 className={`text-4xl font-bold tracking-tight ${stats.pending_today > 0 ? 'text-amber-600' : 'text-brand-900'}`}>
                                    {stats.pending_today}
                                </h3>
                            )}
                        </div>
                        <div className={`p-3 rounded-xl ${stats.pending_today > 0 ? 'bg-amber-100/80' : 'bg-brand-100/50'}`}>
                            <Clock className={`w-6 h-6 ${stats.pending_today > 0 ? 'text-amber-600' : 'text-brand-600'}`} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Split View Area */}
            <div className="flex flex-col gap-6 md:flex-row md:gap-6 md:h-full md:min-h-0 flex-1">

                {/* Left: Feed */}
                <div className="order-1 md:order-none w-full lg:col-span-2 flex flex-col h-[400px] md:h-full md:min-h-0 bg-white/60 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-sm md:flex-1 overflow-hidden">
                    <div className="p-4 border-b border-slate-200/60 flex items-center justify-between shrink-0 bg-white/40">
                        <h2 className="font-semibold text-brand-900 flex items-center gap-2 text-sm">
                            <div className="p-1.5 rounded-lg bg-white/60 shadow-sm border border-slate-200/50">
                                <Utensils className="w-4 h-4 text-brand-700" />
                            </div>
                            Feed em Tempo Real
                        </h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-brand-600 hover:text-brand-900 hover:bg-white/60 rounded-lg"
                            onClick={() => router.push('/admin/orders')}
                        >
                            Expandir <ArrowUpRight className="w-3 h-3 ml-1" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {errorFeed ? (
                            <div className="flex flex-col items-center justify-center h-full text-red-500 text-center p-4">
                                <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                                <p className="text-sm font-medium">{errorFeed}</p>
                            </div>
                        ) : loadingFeed ? (
                            <div className="space-y-3">
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-slate-200/50 animate-pulse rounded-xl" />)}
                            </div>
                        ) : recentOrders.length > 0 ? (
                            recentOrders.map((order) => {
                                const userName = order.users?.name || 'Cliente'
                                const menuItemName = order.menu_items?.name || 'Item'
                                const status = (order.status || '').toLowerCase()

                                return (
                                    <div key={order.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/60 bg-white/40 hover:bg-white/60 hover:border-slate-300 transition-all shadow-sm">
                                        <Avatar className="h-10 w-10 border border-slate-200 shadow-sm">
                                            <AvatarFallback className="bg-brand-50 text-brand-800 font-bold text-xs">
                                                {userName.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-semibold text-brand-900 text-sm truncate">{userName}</h4>
                                                <span className="text-[10px] font-medium text-brand-600 whitespace-nowrap">
                                                    {format(new Date(order.created_at), 'HH:mm')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className={`
                                                    text-[10px] font-semibold px-1.5 py-0.5 rounded-md border
                                                    ${status === 'pending' ? 'bg-amber-100/80 border-amber-200/60 text-amber-700' :
                                                        status === 'confirmed' ? 'bg-green-100/80 border-green-200/60 text-green-800' : 'bg-red-100/80 border-red-200/60 text-red-700'}
                                                `}>
                                                    {status === 'pending' ? 'PENDENTE' : status === 'confirmed' ? 'CONFIRMADO' : 'CANCELADO'}
                                                </Badge>
                                                <span className="text-xs text-brand-600 truncate max-w-[150px]">
                                                    {menuItemName}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-brand-600">
                                <Coffee className="w-10 h-10 mb-2 opacity-30" />
                                <p className="text-sm">Sem pedidos recentes</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Production + Satisfaction */}
                <div className="order-2 md:order-none w-full md:w-80 lg:w-96 flex flex-col gap-6 h-auto md:h-full md:min-h-0 md:overflow-y-auto">

                    {/* Compact Satisfaction Widget */}
                    <SatisfactionWidgetCompact date={currentDateStr} />

                    {/* Production Breakdown */}
                    <div className="flex flex-col h-auto min-h-[300px] bg-white/60 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-200/60 shrink-0 bg-white/40">
                            <h2 className="font-semibold text-brand-900 flex items-center gap-2 text-sm">
                                <div className="p-1.5 rounded-lg bg-white/60 shadow-sm border border-slate-200/50">
                                    <ChefHat className="w-4 h-4 text-brand-700" />
                                </div>
                                Resumo de Produção
                                <Badge variant="secondary" className="bg-white/80 border border-slate-200/50 shadow-sm text-brand-900 ml-auto font-mono text-xs">
                                    {totalProduction} un
                                </Badge>
                            </h2>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 min-h-0 relative">
                            {loadingFeed ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => <div key={i} className="h-10 w-full bg-slate-200/50 animate-pulse rounded-lg" />)}
                                </div>
                            ) : productionList.length > 0 ? (
                                <div className="space-y-3">
                                    {productionList.map((item, index) => {
                                        const percentage = Math.round((item.count / totalProduction) * 100)

                                        return (
                                            <div key={index} className="group">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium text-brand-900 truncate pr-2 max-w-[70%]">
                                                        {item.name}
                                                    </span>
                                                    <Badge className="bg-brand-800 text-white shadow-md shadow-brand-900/20 font-mono text-xs px-2 h-6">
                                                        {item.count}
                                                    </Badge>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-200/60 rounded-full overflow-hidden shadow-inner">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-brand-800 to-brand-700 rounded-full transition-all duration-500"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-brand-600">
                                    <ListChecks className="w-8 h-8 mb-2 opacity-30" />
                                    <p className="text-xs">Produção zerada</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
