'use client'

import { useEffect, useState, Suspense } from 'react'
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
    AlertCircle
} from 'lucide-react'
import { format, subDays, addDays, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Toaster } from 'sonner'
import { formatDateDisplay } from '@/lib/utils'

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
    const [loadingChart, setLoadingChart] = useState(true)

    // Independent Error States
    const [errorKPIs, setErrorKPIs] = useState<string | null>(null)
    const [errorFeed, setErrorFeed] = useState<string | null>(null)
    const [errorChart, setErrorChart] = useState<string | null>(null)

    // Data States
    const [stats, setStats] = useState({ total_today: 0, canceled_today: 0, pending_today: 0 })
    const [recentOrders, setRecentOrders] = useState<any[]>([])
    const [weeklyData, setWeeklyData] = useState<any[]>([])

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
            fetchChart(currentDateStr)
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

            const total = data?.length || 0
            const pending = data?.filter((o: any) => o.status === 'pending').length || 0
            const canceled = data?.filter((o: any) => o.status === 'canceled').length || 0

            setStats({ total_today: total, canceled_today: canceled, pending_today: pending })
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

    /**
     * 3. Chart Fetch (Analytical)
     */
    async function fetchChart(date: string) {
        setLoadingChart(true)
        setErrorChart(null)
        try {
            console.log("📈 Fetching Chart for:", date)
            const chartData = []
            const targetDateObj = parseISO(date)

            for (let i = 4; i >= 0; i--) {
                const d = subDays(targetDateObj, i)
                const dStr = format(d, 'yyyy-MM-dd')

                const { count, error } = await supabase
                    .from('orders')
                    .select('*', { count: 'exact', head: true })
                    .eq('consumption_date', dStr)

                if (error) {
                    console.error(`❌ Erro no dia ${dStr}:`, error.message)
                    continue
                }

                chartData.push({
                    name: format(d, 'EEE', { locale: ptBR }),
                    fullDate: format(d, 'dd/MM'),
                    orders: count || 0
                })
            }
            setWeeklyData(chartData)
        } catch (err: any) {
            console.error("❌ Erro Gráfico:", err.message)
            setErrorChart("Falha ao carregar métricas")
        } finally {
            setLoadingChart(false)
        }
    }


    // Navigation Handlers
    const handlePrevDay = () => router.push(`/admin?date=${format(subDays(parseISO(currentDateStr), 1), 'yyyy-MM-dd')}`)
    const handleNextDay = () => router.push(`/admin?date=${format(addDays(parseISO(currentDateStr), 1), 'yyyy-MM-dd')}`)
    const handleToday = () => router.push('/admin')

    if (!user) return null

    return (
        // Main Container: Screen Height, No Page Scroll
        <div className="h-[calc(100vh-2rem)] flex flex-col p-6 max-w-[1600px] mx-auto font-sans overflow-hidden">
            <Toaster position="top-right" richColors />

            {/* Compact Header: Single Row */}
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center gap-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            Cockpit Operacional
                            <span className="text-slate-300 font-light hidden md:inline">|</span>
                        </h1>
                        <p className="text-slate-500 text-xs mt-1">
                            Visão do dia <span className="font-semibold text-slate-700 capitalize">{formatDateDisplay(currentDateStr)}</span>
                        </p>
                    </div>

                    {/* Date Navigation (Inline) */}
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-sm">
                        <Button variant="ghost" size="icon" onClick={handlePrevDay} className="h-7 w-7 hover:bg-white hover:text-slate-900 rounded-lg text-slate-500">
                            <ChevronLeft className="w-4 h-4" />
                        </Button>

                        <div className="flex items-center gap-2 px-2 font-medium text-slate-700 min-w-[100px] justify-center cursor-pointer hover:bg-white/50 py-1 rounded-md transition-all" onClick={() => document.getElementById('date-picker')?.click()}>
                            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                            <span className="capitalize">{formatDateDisplay(currentDateStr)}</span>
                        </div>

                        <Button variant="ghost" size="icon" onClick={handleNextDay} className="h-7 w-7 hover:bg-white hover:text-slate-900 rounded-lg text-slate-500">
                            <ChevronRight className="w-4 h-4" />
                        </Button>

                        {dateParam && (
                            <button onClick={handleToday} className="px-2 text-xs text-green-600 hover:bg-green-50 rounded-md font-medium h-7 transition-colors">
                                Hoje
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${loadingKPIs ? 'bg-amber-400 animate-pulse' : errorKPIs ? 'bg-red-500' : 'bg-green-300'}`} title="Status KPIs" />
                        <div className={`w-2 h-2 rounded-full ${loadingFeed ? 'bg-amber-400 animate-pulse' : errorFeed ? 'bg-red-500' : 'bg-green-300'}`} title="Status Feed" />
                        <div className={`w-2 h-2 rounded-full ${loadingChart ? 'bg-amber-400 animate-pulse' : errorChart ? 'bg-red-500' : 'bg-green-300'}`} title="Status Chart" />
                    </div>
                </div>
            </div>

            {/* Slim KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 shrink-0">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50/50 to-white">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">Pedidos do Dia</p>
                            {loadingKPIs ? (
                                <div className="h-8 w-16 bg-green-100/50 animate-pulse rounded-lg" />
                            ) : (
                                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{stats.total_today}</h3>
                            )}
                        </div>
                        <div className="p-2.5 bg-green-100 rounded-xl text-green-700">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-gradient-to-br from-rose-50/50 to-white">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-1">Cancelamentos</p>
                            {loadingKPIs ? (
                                <div className="h-8 w-16 bg-rose-100/50 animate-pulse rounded-lg" />
                            ) : (
                                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{stats.canceled_today}</h3>
                            )}
                        </div>
                        <div className="p-2.5 bg-rose-100 rounded-xl text-rose-700">
                            <Ban className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className={`border-0 shadow-sm transition-all ${stats.pending_today > 0 ? 'bg-amber-50 ring-2 ring-amber-100' : 'bg-white'}`}>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${stats.pending_today > 0 ? 'text-amber-700' : 'text-slate-400'}`}>Fila Pendente</p>
                            {loadingKPIs ? (
                                <div className="h-8 w-16 bg-slate-100 animate-pulse rounded-lg" />
                            ) : (
                                <h3 className={`text-3xl font-bold tracking-tight ${stats.pending_today > 0 ? 'text-amber-800' : 'text-slate-900'}`}>{stats.pending_today}</h3>
                            )}
                        </div>
                        <div className={`p-2.5 rounded-xl ${stats.pending_today > 0 ? 'bg-amber-200 text-amber-800' : 'bg-slate-100 text-slate-500'}`}>
                            <Clock className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Split View Area (Flex Grow to fill remaining height) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">

                {/* Left: Feed (Scrollable) */}
                <div className="lg:col-span-2 flex flex-col h-full min-h-0 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                        <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                            <Utensils className="w-4 h-4 text-slate-400" />
                            Feed em Tempo Real
                        </h2>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => router.push('/admin/orders')}>
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
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-xl" />)}
                            </div>
                        ) : recentOrders.length > 0 ? (
                            recentOrders.map((order) => {
                                const userName = order.users?.name || 'Cliente'
                                const menuItemName = order.menu_items?.name || 'Item'

                                return (
                                    <div key={order.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors">
                                        <Avatar className="h-10 w-10 border border-white shadow-sm">
                                            <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-xs">
                                                {userName.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-bold text-slate-900 text-sm truncate">{userName}</h4>
                                                <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">
                                                    {format(new Date(order.created_at), 'HH:mm')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className={`
                                                    text-[10px] font-bold px-1 py-0 rounded
                                                    ${order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                        order.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                                                `}>
                                                    {order.status === 'pending' ? 'PENDENTE' : order.status === 'confirmed' ? 'CONFIRMADO' : 'CANCELADO'}
                                                </Badge>
                                                <span className="text-xs text-slate-500 truncate max-w-[150px]">
                                                    {menuItemName}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-slate-300">
                                <Coffee className="w-10 h-10 mb-2 opacity-50" />
                                <p className="text-sm">Sem pedidos recentes</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Chart (Fixed Height) */}
                <div className="flex flex-col h-full min-h-0 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <div className="p-4 border-b border-slate-100 shrink-0">
                        <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                            <TrendingUp className="w-4 h-4 text-slate-400" />
                            Tendência
                        </h2>
                    </div>

                    <div className="flex-1 p-4 min-h-0">
                        {errorChart ? (
                            <div className="h-full flex items-center justify-center text-red-400 text-xs">
                                {errorChart}
                            </div>
                        ) : loadingChart ? (
                            <div className="h-full w-full bg-slate-50 animate-pulse rounded-xl" />
                        ) : weeklyData.reduce((acc, curr) => acc + curr.orders, 0) > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                    />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                                        dy={5}
                                    />
                                    <Bar
                                        dataKey="orders"
                                        fill="#22c55e"
                                        radius={[4, 4, 4, 4]}
                                        barSize={24}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center text-slate-300">
                                <CalendarOff className="w-8 h-8 mb-2 opacity-50" />
                                <p className="text-xs">Sem dados</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
