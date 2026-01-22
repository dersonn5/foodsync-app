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
    Calendar as CalendarIcon
} from 'lucide-react'
import { format, subDays, addDays, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Toaster, toast } from 'sonner'
import { formatDateDisplay } from '@/lib/utils'

// Componente wrapper para usar useSearchParams com Suspense
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
    const [loading, setLoading] = useState(true)

    // Data States
    const [stats, setStats] = useState({ total_today: 0, canceled_today: 0, pending_today: 0 })
    const [recentOrders, setRecentOrders] = useState<any[]>([])
    const [weeklyData, setWeeklyData] = useState<any[]>([])

    // Determine current date from URL or default to Today
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
            fetchDashboardData(currentDateStr)
        }
        checkAuth()
    }, [currentDateStr])

    // Navigation Handlers
    const handlePrevDay = () => {
        const prev = subDays(parseISO(currentDateStr), 1)
        router.push(`/admin?date=${format(prev, 'yyyy-MM-dd')}`)
    }

    const handleNextDay = () => {
        const next = addDays(parseISO(currentDateStr), 1)
        router.push(`/admin?date=${format(next, 'yyyy-MM-dd')}`)
    }

    const handleToday = () => {
        router.push('/admin')
    }

    async function fetchDashboardData(targetDate: string) {
        setLoading(true)
        try {
            console.log("Fetching dashboard for:", targetDate)

            // A. Fetch Orders for the Selected Date (KPIs + Feed)
            // STRICTLY filtering by 'consumption_date'
            const { data: dailyOrders, error: kpiError } = await supabase
                .from('orders')
                .select('id, created_at, status, users(name, email), menu_items(name, type)')
                .eq('consumption_date', targetDate) // Critical Fix: use consumption_date
                .order('created_at', { ascending: false })

            if (kpiError) throw kpiError

            // Calculate KPIs
            const total = dailyOrders?.length || 0
            const pending = dailyOrders?.filter((o: any) => o.status === 'pending').length || 0
            const canceled = dailyOrders?.filter((o: any) => o.status === 'canceled').length || 0

            setStats({ total_today: total, canceled_today: canceled, pending_today: pending })
            setRecentOrders(dailyOrders || [])

            // B. Fetch Weekly Data (Last 5 Days ending on Selected Date)
            // Context chart relative to the day being viewed
            const chartData = []
            const targetDateObj = parseISO(targetDate)

            for (let i = 4; i >= 0; i--) {
                const d = subDays(targetDateObj, i)
                const dStr = format(d, 'yyyy-MM-dd')

                // Count orders for that specific consumption date
                const { count } = await supabase
                    .from('orders')
                    .select('*', { count: 'exact', head: true })
                    .eq('consumption_date', dStr)

                chartData.push({
                    name: format(d, 'EEE', { locale: ptBR }), // "seg", "ter"
                    fullDate: format(d, 'dd/MM'),
                    orders: count || 0
                })
            }
            setWeeklyData(chartData)

        } catch (error) {
            console.error('Error fetching dashboard:', error)
            toast.error('Erro ao atualizar dashboard')
        } finally {
            setLoading(false)
        }
    }

    if (!user) return null

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 font-sans animate-in fade-in duration-500">
            <Toaster position="top-right" richColors />

            {/* Header with Navigation */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        Live Operations
                        <span className="text-slate-300 font-light hidden md:inline">|</span>

                        {/* Date Navigation Controls */}
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

                <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl px-6 h-11 pointer-events-none shadow-lg">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2" />
                    Sistema Operando
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-gradient-to-br from-green-50/50 to-white">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-green-100 rounded-2xl text-green-700">
                                <ShoppingBag className="w-6 h-6" />
                            </div>
                            <Badge variant="outline" className="bg-white text-green-700 border-green-200 font-bold">
                                {format(parseISO(currentDateStr), 'dd/MM')}
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-4xl font-bold text-slate-900 tracking-tight">{stats.total_today}</h3>
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
                                {format(parseISO(currentDateStr), 'dd/MM')}
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-4xl font-bold text-slate-900 tracking-tight">{stats.canceled_today}</h3>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Cancelamentos</p>
                            <p className="text-xs text-rose-600/80 font-medium">Refeições não servidas</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className={`border-0 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all ${stats.pending_today > 0 ? 'bg-amber-50 ring-2 ring-amber-100' : 'bg-white'}`}>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${stats.pending_today > 0 ? 'bg-amber-200 text-amber-800' : 'bg-slate-100 text-slate-500'}`}>
                                <Clock className="w-6 h-6" />
                            </div>
                            {stats.pending_today > 0 && (
                                <Badge className="bg-amber-500 hover:bg-amber-600 border-0 animate-pulse">
                                    Atenção
                                </Badge>
                            )}
                        </div>
                        <div className="space-y-1">
                            <h3 className={`text-4xl font-bold tracking-tight ${stats.pending_today > 0 ? 'text-amber-800' : 'text-slate-900'}`}>{stats.pending_today}</h3>
                            <p className={`text-sm font-medium uppercase tracking-wide ${stats.pending_today > 0 ? 'text-amber-700' : 'text-slate-500'}`}>Fila Pendente</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

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
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-2xl" />)}
                            </div>
                        ) : recentOrders.length > 0 ? (
                            recentOrders.map((order) => (
                                <div key={order.id} className="group flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-green-100 transition-all">
                                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                                        <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-lg">
                                            {order.users?.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-slate-900 truncate">{order.users?.name}</h4>
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
                                                pediu <span className="font-semibold">{order.menu_items?.name}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
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
                            {weeklyData.reduce((acc, curr) => acc + curr.orders, 0) > 0 ? (
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
