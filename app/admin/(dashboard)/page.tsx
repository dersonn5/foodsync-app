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
     * Queries pure counts based on consumption_date.
     * Less dependent on Joins, failsafe.
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
     * Involves Joins with Users/MenuItems. 
     * If this fails due to RLS/FK, it won't kill KPIs.
     */
    async function fetchFeed(date: string) {
        setLoadingFeed(true)
        setErrorFeed(null)
        try {
            console.log("🥘 Fetching Feed for:", date)
            // Explicit Foreign Key syntax to avoid ambiguity
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id, 
                    created_at, 
                    status, 
                    consumption_date,
                    users:user_id (name),
                    menu_items:menu_item_id (name)
                `)
                .eq('consumption_date', date)
                .order('created_at', { ascending: false })

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
     * Complex loop, separate from Ops data.
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
                    continue // Skip only the failing day
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
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 font-sans animate-in fade-in duration-500">
            <Toaster position="top-right" richColors />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        Live Operations
                        <span className="text-slate-300 font-light hidden md:inline">|</span>

                        {/* Date Navigation */}
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-base">
                            <Button variant="ghost" size="icon" onClick={handlePrevDay} className="h-8 w-8 hover:bg-white hover:text-slate-900 rounded-lg text-slate-500">
                                <ChevronLeft className="w-5 h-5" />
                            </Button>

                            <div className="flex items-center gap-2 px-2 font-medium text-slate-700 min-w-[140px] justify-center cursor-pointer hover:bg-white/50 py-1 rounded-md transition-all" onClick={() => document.getElementById('date-picker')?.click()}>
                                <CalendarIcon className="w-4 h-4 text-slate-400" />
                                <span className="capitalize">{formatDateDisplay(currentDateStr)}</span>
                            </div>

                            <Button variant="ghost" size="icon" onClick={handleNextDay} className="h-8 w-8 hover:bg-white hover:text-slate-900 rounded-lg text-slate-500">
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>
                    </h1>
                    <p className="text-slate-500 text-sm mt-2 ml-1">
                        Gerenciando pedidos para o dia <span className="font-semibold text-slate-700 capitalize">{formatDateDisplay(currentDateStr)}</span>
                        {dateParam && (
                            <button onClick={handleToday} className="ml-3 text-xs text-green-600 hover:underline font-medium">
                                Voltar para Hoje
                            </button>
                        )}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Debug status indicators */}
                    <div className="flex gap-1">
                        <div className={`w-2 h-2 rounded-full ${loadingKPIs ? 'bg-amber-400 animate-pulse' : errorKPIs ? 'bg-red-500' : 'bg-green-300'}`} title="Status KPIs" />
                        <div className={`w-2 h-2 rounded-full ${loadingFeed ? 'bg-amber-400 animate-pulse' : errorFeed ? 'bg-red-500' : 'bg-green-300'}`} title="Status Feed" />
                        <div className={`w-2 h-2 rounded-full ${loadingChart ? 'bg-amber-400 animate-pulse' : errorChart ? 'bg-red-500' : 'bg-green-300'}`} title="Status Chart" />
                    </div>
                </div>
            </div>

            {/* KPI Cards Section */}
            {errorKPIs ? (
                <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-700 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">{errorKPIs}</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-0 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-gradient-to-br from-green-50/50 to-white">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-green-100 rounded-2xl text-green-700">
                                    <ShoppingBag className="w-6 h-6" />
                                </div>
                                <Badge variant="outline" className="bg-white text-green-700 border-green-200 font-bold">
                                    {loadingKPIs ? '...' : format(parseISO(currentDateStr), 'dd/MM')}
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                {loadingKPIs ? (
                                    <div className="h-9 w-24 bg-green-100/50 animate-pulse rounded-lg" />
                                ) : (
                                    <h3 className="text-4xl font-bold text-slate-900 tracking-tight">{stats.total_today}</h3>
                                )}
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Pedidos do Dia</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-gradient-to-br from-rose-50/50 to-white">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-rose-100 rounded-2xl text-rose-700">
                                    <Ban className="w-6 h-6" />
                                </div>
                                <Badge variant="outline" className="bg-white text-rose-700 border-rose-200 font-bold">
                                    {loadingKPIs ? '...' : format(parseISO(currentDateStr), 'dd/MM')}
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                {loadingKPIs ? (
                                    <div className="h-9 w-24 bg-rose-100/50 animate-pulse rounded-lg" />
                                ) : (
                                    <h3 className="text-4xl font-bold text-slate-900 tracking-tight">{stats.canceled_today}</h3>
                                )}
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Cancelamentos</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={`border-0 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all ${stats.pending_today > 0 ? 'bg-amber-50 ring-2 ring-amber-100' : 'bg-white'}`}>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-2xl ${stats.pending_today > 0 ? 'bg-amber-200 text-amber-800' : 'bg-slate-100 text-slate-500'}`}>
                                    <Clock className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                {loadingKPIs ? (
                                    <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-lg" />
                                ) : (
                                    <h3 className={`text-4xl font-bold tracking-tight ${stats.pending_today > 0 ? 'text-amber-800' : 'text-slate-900'}`}>{stats.pending_today}</h3>
                                )}
                                <p className={`text-sm font-medium uppercase tracking-wide ${stats.pending_today > 0 ? 'text-amber-700' : 'text-slate-500'}`}>Fila Pendente</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Utensils className="w-5 h-5 text-slate-400" />
                            Feed de Pedidos ({currentDateStr})
                        </h2>
                        <Button variant="ghost" className="text-sm text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => router.push('/admin/orders')}>
                            Ver Todos <ArrowUpRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {errorFeed ? (
                            <div className="p-8 bg-red-50 border border-dashed border-red-200 rounded-2xl text-center">
                                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                                <h3 className="text-red-800 font-bold mb-1">Erro no Feed</h3>
                                <p className="text-sm text-red-600">{errorFeed}</p>
                                <p className="text-xs text-red-400 mt-2">Verifique o Console para detalhes técnicos.</p>
                            </div>
                        ) : loadingFeed ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-2xl" />)}
                            </div>
                        ) : recentOrders.length > 0 ? (
                            recentOrders.map((order) => {
                                // Safe Access to joined data
                                // If Join fails, these might be null/undefined, so we provide fallbacks
                                const userName = order.users?.name || 'Cliente Desconhecido'
                                const menuItemName = order.menu_items?.name || 'Item não encontrado'

                                return (
                                    <div key={order.id} className="group flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-green-100 transition-all">
                                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                                            <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-lg">
                                                {userName.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-slate-900 truncate">{userName}</h4>
                                                <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                                                    {format(new Date(order.created_at), 'HH:mm')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Badge variant="secondary" className={`
                                                    text-[10px] font-bold px-1.5 py-0 rounded-md
                                                    ${order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                        order.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                                                `}>
                                                    {order.status === 'pending' ? 'PENDENTE' : order.status === 'confirmed' ? 'CONFIRMADO' : 'CANCELADO'}
                                                </Badge>
                                                <span className="text-sm text-slate-600 truncate">
                                                    pediu <span className="font-semibold">{menuItemName}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
                                <Coffee className="w-12 h-12 text-slate-200 mb-3" />
                                <h3 className="text-lg font-bold text-slate-400">Tudo calmo por aqui</h3>
                                <p className="text-sm text-slate-300">Nenhum pedido para consumo nesta data.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Weekly Chart */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-slate-400" />
                        Performance (5 Dias)
                    </h2>

                    <Card className="border-0 shadow-sm bg-slate-50/50">
                        <CardContent className="p-6">
                            {errorChart ? (
                                <div className="h-[300px] flex flex-col items-center justify-center text-center p-4">
                                    <AlertCircle className="w-8 h-8 text-red-300 mb-2" />
                                    <p className="text-sm text-red-400">{errorChart}</p>
                                </div>
                            ) : loadingChart ? (
                                <div className="h-[300px] w-full bg-slate-100 animate-pulse rounded-xl" />
                            ) : weeklyData.reduce((acc, curr) => acc + curr.orders, 0) > 0 ? (
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={weeklyData}>
                                            <Tooltip
                                                cursor={{ fill: '#f1f5f9' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                                dy={10}
                                            />
                                            <Bar
                                                dataKey="orders"
                                                fill="#22c55e"
                                                radius={[6, 6, 6, 6]}
                                                barSize={32}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-[300px] flex flex-col items-center justify-center text-center p-4">
                                    <CalendarOff className="w-10 h-10 text-slate-300 mb-3" />
                                    <p className="text-sm font-medium text-slate-400">Sem dados no período.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 text-white border-0 shadow-lg overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-3xl -mr-10 -mt-10" />
                        <CardContent className="p-6 relative z-10">
                            <h3 className="font-bold text-lg mb-2">Painel de Controle 🎛️</h3>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                Use as setas acima para navegar entre os dias. Os dados mostrados refletem apenas o que deve ser servido (consumido) na data selecionada.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
