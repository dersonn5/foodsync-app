'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Award,
    Loader2,
    LogOut,
    BarChart3,
    ChefHat,
    Utensils,
    Download,
    Filter,
    Building2,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Area,
    AreaChart,
    BarChart,
    Bar,
    ComposedChart
} from 'recharts'
import { format, parseISO, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { OnboardingTour } from '@/components/admin/OnboardingTour'

// --- Mock Data Constants ---
const UNITS = [
    { id: 'global', name: 'Visão Global' },
    { id: 'matriz', name: 'Matriz - SP' },
    { id: 'filial_sul', name: 'Filial Sul' },
    { id: 'filial_norte', name: 'Filial Norte' }
]

const MOCK_TARGET_CMV = 13.00 // Meta de custo
const MOCK_BASE_COST = 11.50  // Custo base simulado

export default function CEODashboard() {
    const router = useRouter()
    const supabase = createClient()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Filters
    const [selectedUnit, setSelectedUnit] = useState('global')
    const [period, setPeriod] = useState('this_month')

    // Data State
    const [rawData, setRawData] = useState<any[]>([])


    // Auth & Data Fetch
    useEffect(() => {
        async function init() {
            setLoading(true)

            // 1. Auth
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            if (authError || !user) {
                router.push('/admin/login')
                return
            }
            setUser(user)

            // 2. Fetch Orders (Real Data)
            // Fetching last 1000 orders to have enough sample
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select(`
                    id, 
                    consumption_date, 
                    status,
                    menu_item:menu_items(name)
                `)
                .order('consumption_date', { ascending: false })
                .limit(2000)

            if (ordersData) {
                setRawData(ordersData)
            }

            setLoading(false)
        }
        init()
    }, [router, supabase])

    // --- Data Processing Engine ---
    const metrics = useMemo(() => {
        // Allow processing even if empty to show structure (zeros)

        // 1. Filter by Period
        const now = new Date()
        let start = startOfMonth(now)
        let end = endOfMonth(now)

        if (period === 'today') {
            start = now
            end = now
        } else if (period === 'this_week') {
            start = startOfWeek(now, { weekStartsOn: 1 })
            end = endOfWeek(now, { weekStartsOn: 1 })
        } else if (period === 'last_30') {
            start = subDays(now, 30)
            end = now
        }

        const filteredOrders = rawData.filter(o => {
            if (!o.consumption_date) return false
            const date = parseISO(o.consumption_date)
            return isWithinInterval(date, { start, end })
        })

        // 2. Metrics Calculation
        const totalOrders = filteredOrders.length

        const canceledOrders = filteredOrders.filter(o => {
            const s = (o.status || '').toLowerCase().trim()
            return s === 'cancelled' || s === 'canceled'
        })

        const confirmedOrders = filteredOrders.filter(o => {
            const s = (o.status || '').toLowerCase().trim()
            return s !== 'cancelled' && s !== 'canceled'
        })

        // Mock Cost Calculation (Random variation based on date to show trends)
        const currentCMV = totalOrders > 0
            ? MOCK_BASE_COST + (Math.random() * 2)
            : MOCK_BASE_COST

        const wasteRate = totalOrders > 0
            ? (canceledOrders.length / totalOrders) * 100
            : 0

        // Mock NPS (Real implementation would fetch feedbacks)
        const npsScore = 78 + Math.floor(Math.random() * 5)

        // 3. Charts Preparation

        // Line Chart: Quality vs Cost (Last 30 days evolution)
        // Group by Date from rawData (to allow trend analysis even if period is short selected)
        const dailyStats = new Map()
        // Use filtered or raw? Let's use raw for the chart to always show 30 day trend
        // actually let's filter last 30 days from raw for the chart specifically
        const chartStart = subDays(now, 30)
        const chartDataRaw = rawData.filter(o => parseISO(o.consumption_date) >= chartStart)

        chartDataRaw.forEach(o => {
            const date = o.consumption_date
            if (!dailyStats.has(date)) {
                dailyStats.set(date, { date, total: 0, cost: MOCK_BASE_COST + Math.random(), quality: 4.0 + (Math.random() * 0.8) })
            }
            const stat = dailyStats.get(date)
            stat.total++
            // Simulate day-to-day variation
        })

        const trendData = Array.from(dailyStats.values())
            .sort((a, b) => a.date.localeCompare(b.date))
            .map(d => ({
                ...d,
                dateDisplay: format(parseISO(d.date), 'dd/MM')
            }))

        // Bar Chart: Heroes vs Villains
        const itemCounts: Record<string, { name: string, confirmed: number, cancelled: number }> = {}

        filteredOrders.forEach(o => {
            const name = o.menu_item?.name || 'Item Desconhecido'
            if (!itemCounts[name]) itemCounts[name] = { name, confirmed: 0, cancelled: 0 }

            const isCancelled = (o.status || '').toLowerCase().trim() === 'cancelled' || (o.status || '').toLowerCase().trim() === 'canceled'
            if (isCancelled) itemCounts[name].cancelled++
            else itemCounts[name].confirmed++
        })

        const itemArray = Object.values(itemCounts)
        // Top 3 Confirmed
        const topHeroes = [...itemArray].sort((a, b) => b.confirmed - a.confirmed).slice(0, 3)
        // Top 3 Cancelled
        const topVillains = [...itemArray].sort((a, b) => b.cancelled - a.cancelled).filter(i => i.cancelled > 0).slice(0, 3)

        // 4. Rankings (Mock Distribution)
        // Distribute real total across 3 units pseudo-randomly for display
        const mat = Math.floor(confirmedOrders.length * 0.5)
        const sul = Math.floor(confirmedOrders.length * 0.3)
        const nor = confirmedOrders.length - mat - sul

        const rankings = [
            { id: 'matriz', name: 'Matriz - SP', total: mat, rejected: Math.floor(canceledOrders.length * 0.4), cost: 12.40 },
            { id: 'filial_sul', name: 'Filial Sul', total: sul, rejected: Math.floor(canceledOrders.length * 0.2), cost: 12.80 },
            { id: 'filial_norte', name: 'Filial Norte', total: nor, rejected: Math.floor(canceledOrders.length * 0.4), cost: 13.50 },
        ].sort((a, b) => b.total - a.total)

        // Unit Filter Logic
        let finalCMV = currentCMV
        let finalVolume = confirmedOrders.length
        let finalWaste = wasteRate

        if (selectedUnit !== 'global') {
            // Apply mock multiplier for units to vary data
            if (selectedUnit === 'matriz') { finalCMV -= 0.5; finalVolume = mat }
            if (selectedUnit === 'filial_sul') { finalCMV += 0.2; finalVolume = sul }
            if (selectedUnit === 'filial_norte') { finalCMV += 1.5; finalVolume = nor }
        }

        return {
            financial: { cmv: finalCMV, target: MOCK_TARGET_CMV },
            efficiency: { wasteRate: finalWaste, wasteCount: canceledOrders.length },
            volume: { total: finalVolume },
            satisfaction: { nps: npsScore },
            charts: { trendData, topHeroes, topVillains },
            rankings
        }

    }, [rawData, period, selectedUnit])


    if (!user) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100 font-sans">
            <OnboardingTour />

            {/* 1. Header & Navigation - Clean Kitchen Theme */}
            <div id="tour-ceo-header" className="bg-white/80 backdrop-blur-xl border-b border-stone-200/50 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Brand */}
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
                                <ChefHat className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-stone-800 tracking-tight flex items-center gap-2">
                                    Cockpit Executivo
                                    {/* Live Indicator */}
                                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                        LIVE
                                    </span>
                                </h1>
                                <p className="text-sm text-stone-500">Visão Estratégica & Operacional</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-stone-400 hidden md:flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                Atualizado às {format(new Date(), "HH:mm", { locale: ptBR })}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push('/admin')}
                                className="border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-800 rounded-xl"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Voltar para Admin
                            </Button>
                        </div>
                    </div>

                    {/* Filter Bar - Glassmorphism */}
                    <div id="tour-ceo-filters" className="mt-5 flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-100">
                        <div className="flex items-center gap-3 w-full md:w-auto">

                            {/* Unit Selector - Clean */}
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 z-10" />
                                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                                    <SelectTrigger className="w-full md:w-[200px] pl-10 bg-white border-stone-200 text-stone-700 rounded-xl hover:border-stone-300 transition-all shadow-sm">
                                        <SelectValue placeholder="Selecione a Unidade" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-stone-200 rounded-xl shadow-lg">
                                        {UNITS.map(u => (
                                            <SelectItem
                                                key={u.id}
                                                value={u.id}
                                                className="text-stone-700 focus:bg-emerald-50 focus:text-emerald-700"
                                            >
                                                {u.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Period Selector - Clean */}
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 z-10" />
                                <Select value={period} onValueChange={setPeriod}>
                                    <SelectTrigger className="w-full md:w-[180px] pl-10 bg-white border-stone-200 text-stone-700 rounded-xl hover:border-stone-300 transition-all shadow-sm">
                                        <SelectValue placeholder="Período" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-stone-200 rounded-xl shadow-lg">
                                        <SelectItem value="today" className="text-stone-700 focus:bg-emerald-50 focus:text-emerald-700">Hoje</SelectItem>
                                        <SelectItem value="this_week" className="text-stone-700 focus:bg-emerald-50 focus:text-emerald-700">Esta Semana</SelectItem>
                                        <SelectItem value="this_month" className="text-stone-700 focus:bg-emerald-50 focus:text-emerald-700">Este Mês</SelectItem>
                                        <SelectItem value="last_30" className="text-stone-700 focus:bg-emerald-50 focus:text-emerald-700">Últimos 30 dias</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Export Button */}
                        <Button
                            id="tour-ceo-export"
                            variant="ghost"
                            className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 w-full md:w-auto rounded-xl"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Exportar Relatório PDF
                        </Button>
                    </div>
                </div>
            </div>

            {/* 2. Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8 pb-32">
                {loading || !metrics ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-8">

                        {/* 2.1 Strategic KPIs - Clean Kitchen Theme */}
                        <div id="tour-ceo-kpis" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

                            {/* Financial CMV */}
                            <Card className="bg-white/70 backdrop-blur-xl border-stone-200/50 shadow-lg shadow-black/5 rounded-2xl group hover:shadow-xl hover:border-emerald-200 transition-all">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardDescription className="text-stone-500 text-xs font-medium uppercase tracking-wider">CMV Projetado</CardDescription>
                                        <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/20">
                                            <DollarSign className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                    <CardTitle className="text-3xl font-bold text-stone-800 flex items-baseline gap-1">
                                        <span className="text-sm font-normal text-stone-400">R$</span>
                                        {metrics.financial.cmv.toFixed(2)}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 text-sm mb-3">
                                        <span className={`font-semibold px-2 py-0.5 rounded-md text-xs ${metrics.financial.cmv > metrics.financial.target
                                            ? "text-red-600 bg-red-50 border border-red-100"
                                            : "text-emerald-600 bg-emerald-50 border border-emerald-100"
                                            }`}>
                                            {metrics.financial.cmv > metrics.financial.target ? "+" : "-"}
                                            {Math.abs(metrics.financial.cmv - metrics.financial.target).toFixed(2)}
                                        </span>
                                        <span className="text-stone-400 text-xs">vs Meta R$ {metrics.financial.target.toFixed(2)}</span>
                                    </div>
                                    <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${metrics.financial.cmv > metrics.financial.target
                                                ? 'bg-gradient-to-r from-red-500 to-red-400'
                                                : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                                }`}
                                            style={{ width: `${(metrics.financial.cmv / (metrics.financial.target * 1.2)) * 100}%` }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Efficiency */}
                            <Card className="bg-white/70 backdrop-blur-xl border-stone-200/50 shadow-lg shadow-black/5 rounded-2xl group hover:shadow-xl hover:border-amber-200 transition-all">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardDescription className="text-stone-500 text-xs font-medium uppercase tracking-wider">Taxa de Rejeição</CardDescription>
                                        <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-md shadow-amber-500/20">
                                            <TrendingDown className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                    <CardTitle className="text-3xl font-bold text-stone-800">
                                        {metrics.efficiency.wasteRate.toFixed(1)}%
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 text-sm mb-3">
                                        <Badge variant="secondary" className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 text-xs">
                                            {metrics.efficiency.wasteCount} cancelados
                                        </Badge>
                                        <span className="text-stone-400 text-xs">no período</span>
                                    </div>
                                    <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                                            style={{ width: `${Math.min(metrics.efficiency.wasteRate * 3, 100)}%` }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Volume */}
                            <Card className="bg-white/70 backdrop-blur-xl border-stone-200/50 shadow-lg shadow-black/5 rounded-2xl group hover:shadow-xl hover:border-cyan-200 transition-all">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardDescription className="text-stone-500 text-xs font-medium uppercase tracking-wider">Refeições Servidas</CardDescription>
                                        <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20">
                                            <Utensils className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                    <CardTitle className="text-3xl font-bold text-stone-800">
                                        {metrics.volume.total.toLocaleString('pt-BR')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 text-sm mb-3">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        <span className="text-stone-400 text-xs">Confirmadas e preparadas</span>
                                    </div>
                                    <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 w-full" />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Satisfaction NPS */}
                            <Card className="bg-white/70 backdrop-blur-xl border-stone-200/50 shadow-lg shadow-black/5 rounded-2xl group hover:shadow-xl hover:border-yellow-200 transition-all">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardDescription className="text-stone-500 text-xs font-medium uppercase tracking-wider">Índice NPS</CardDescription>
                                        <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 shadow-md shadow-yellow-500/20">
                                            <Award className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                    <CardTitle className="text-3xl font-bold text-stone-800">
                                        {metrics.satisfaction.nps}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 text-sm mb-3">
                                        <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs">
                                            {metrics.satisfaction.nps >= 70 ? '✨ Excelente' : metrics.satisfaction.nps >= 50 ? '👍 Bom' : '⚠️ Atenção'}
                                        </Badge>
                                    </div>
                                    <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-amber-500"
                                            style={{ width: `${metrics.satisfaction.nps}%` }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 2.2 Charts Section - Clean Kitchen Theme */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                            {/* Quality vs Cost Chart */}
                            <Card id="tour-ceo-trend-chart" className="bg-white/70 backdrop-blur-xl border-stone-200/50 shadow-lg shadow-black/5 rounded-2xl">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-3 text-stone-800">
                                        <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/20">
                                            <TrendingUp className="w-4 h-4 text-white" />
                                        </div>
                                        Evolução: Custo vs Qualidade
                                    </CardTitle>
                                    <CardDescription className="text-stone-500">Relação entre investimento por prato e satisfação (30 dias)</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={metrics.charts.trendData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                                            <XAxis
                                                dataKey="dateDisplay"
                                                tick={{ fontSize: 11, fill: '#78716c' }}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                yAxisId="left"
                                                domain={[10, 15]}
                                                tick={{ fontSize: 11, fill: '#78716c' }}
                                                label={{ value: 'Custo (R$)', angle: -90, position: 'insideLeft', style: { fill: '#78716c', fontSize: 11 } }}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                yAxisId="right"
                                                orientation="right"
                                                domain={[0, 5]}
                                                tick={{ fontSize: 11, fill: '#78716c' }}
                                                label={{ value: 'Nota (0-5)', angle: 90, position: 'insideRight', style: { fill: '#78716c', fontSize: 11 } }}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: '12px',
                                                    border: '1px solid #e7e5e4',
                                                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                                    backgroundColor: '#fff',
                                                    color: '#1c1917'
                                                }}
                                                labelStyle={{ color: '#78716c' }}
                                            />
                                            <Legend />
                                            <Area
                                                yAxisId="left"
                                                type="monotone"
                                                dataKey="cost"
                                                name="Custo Médio (R$)"
                                                fill="url(#costGradient)"
                                                fillOpacity={0.3}
                                                stroke="#f59e0b"
                                                strokeWidth={2}
                                            />
                                            <defs>
                                                <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                                                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="qualityGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Line
                                                yAxisId="right"
                                                type="monotone"
                                                dataKey="quality"
                                                name="Qualidade (0-5)"
                                                stroke="#10b981"
                                                strokeWidth={3}
                                                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                                                activeDot={{ r: 6, fill: '#10b981' }}
                                            />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Heroes vs Villains */}
                            <Card id="tour-ceo-heroes" className="bg-white/70 backdrop-blur-xl border-stone-200/50 shadow-lg shadow-black/5 rounded-2xl flex flex-col">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-3 text-stone-800">
                                        <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20">
                                            <Utensils className="w-4 h-4 text-white" />
                                        </div>
                                        Heróis e Vilões do Cardápio
                                    </CardTitle>
                                    <CardDescription className="text-stone-500">Top pratos mais pedidos vs mais rejeitados</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col gap-6">

                                    {/* Heroes */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-emerald-600 mb-4 flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4" /> Campeões de Vendas
                                        </h4>
                                        <div className="space-y-4">
                                            {metrics.charts.topHeroes.map((item: any, idx: number) => (
                                                <div key={idx} className="relative group">
                                                    <div className="flex justify-between text-sm mb-2 z-10 relative">
                                                        <span className="font-medium text-stone-700 flex items-center gap-2">
                                                            <span className="text-lg">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                                                            {item.name}
                                                        </span>
                                                        <span className="font-bold text-emerald-600">{item.confirmed} pedidos</span>
                                                    </div>
                                                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                                                            style={{ width: `${(item.confirmed / (metrics.charts.topHeroes[0]?.confirmed || 1)) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            {metrics.charts.topHeroes.length === 0 && <p className="text-sm text-stone-400">Sem dados suficientes.</p>}
                                        </div>
                                    </div>

                                    {/* Villains */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-red-600 mb-4 flex items-center gap-2">
                                            <TrendingDown className="w-4 h-4" /> Top Rejeição
                                        </h4>
                                        <div className="space-y-4">
                                            {metrics.charts.topVillains.map((item: any, idx: number) => (
                                                <div key={idx} className="relative group">
                                                    <div className="flex justify-between text-sm mb-2 z-10 relative">
                                                        <span className="font-medium text-stone-700 flex items-center gap-2">
                                                            <span className="text-lg">{idx === 0 ? '⚠️' : idx === 1 ? '🔻' : '📉'}</span>
                                                            {item.name}
                                                        </span>
                                                        <span className="font-bold text-red-600">{item.cancelled} canc.</span>
                                                    </div>
                                                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all"
                                                            style={{ width: `${(item.cancelled / (metrics.charts.topVillains[0]?.cancelled || 1)) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            {metrics.charts.topVillains.length === 0 && <p className="text-sm text-stone-400">Sem dados (Nenhum cancelamento).</p>}
                                        </div>
                                    </div>

                                </CardContent>
                            </Card>
                        </div>

                        {/* 2.3 Unit Leaderboard - Clean Kitchen Theme */}
                        <Card id="tour-ceo-leaderboard" className="bg-white/70 backdrop-blur-xl border-stone-200/50 shadow-lg shadow-black/5 overflow-hidden rounded-2xl">
                            <CardHeader className="bg-stone-50/50 border-b border-stone-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-500/20">
                                            <BarChart3 className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg text-stone-800">Ranking de Performance</CardTitle>
                                            <CardDescription className="text-stone-500">Comparativo de eficiência entre unidades</CardDescription>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled
                                        className="border-stone-200 text-stone-400 rounded-xl"
                                    >
                                        <Filter className="w-4 h-4 mr-2" />
                                        Mais Filtros
                                    </Button>
                                </div>
                            </CardHeader>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-stone-100 hover:bg-transparent">
                                        <TableHead className="w-[100px] text-stone-500">Posição</TableHead>
                                        <TableHead className="text-stone-500">Unidade</TableHead>
                                        <TableHead className="text-right text-stone-500">Total Pedidos</TableHead>
                                        <TableHead className="text-right text-stone-500">Rejeição</TableHead>
                                        <TableHead className="text-right text-stone-500">Custo Est.</TableHead>
                                        <TableHead className="text-right text-stone-500">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {metrics.rankings.map((unit: any, idx: number) => (
                                        <TableRow key={unit.id} className="border-stone-100 hover:bg-stone-50/50 transition-colors">
                                            <TableCell className="font-medium">
                                                <div className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold text-lg ${idx === 0
                                                    ? 'bg-gradient-to-br from-yellow-500 to-amber-600 text-white shadow-md shadow-yellow-500/20'
                                                    : idx === 1
                                                        ? 'bg-gradient-to-br from-stone-400 to-stone-500 text-white shadow-md shadow-stone-500/20'
                                                        : 'bg-stone-100 text-stone-500'
                                                    }`}>
                                                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx + 1}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-semibold text-stone-800">{unit.name}</div>
                                                <div className="text-xs text-stone-400">ID: {unit.id.toUpperCase()}</div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="font-bold text-stone-800 text-lg">{unit.total.toLocaleString('pt-BR')}</span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="font-bold text-red-600">{unit.rejected}</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
                                                                style={{ width: `${Math.min((unit.rejected / (unit.total || 1)) * 100 * 5, 100)}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-stone-400">
                                                            {((unit.rejected / (unit.total || 1)) * 100).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="font-semibold text-stone-800">R$ {unit.cost.toFixed(2)}</span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge
                                                    variant="outline"
                                                    className={unit.cost > MOCK_TARGET_CMV
                                                        ? "bg-red-50 text-red-600 border-red-200 rounded-lg"
                                                        : "bg-emerald-50 text-emerald-600 border-emerald-200 rounded-lg"
                                                    }
                                                >
                                                    {unit.cost > MOCK_TARGET_CMV ? "⚠️ Atenção" : "✓ Regular"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    )
}
