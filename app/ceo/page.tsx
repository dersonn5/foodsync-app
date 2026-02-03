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
    CheckCircle2
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
        <div className="min-h-screen bg-background font-sans">

            {/* 1. Header & Navigation */}
            <div className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
                <div className="h-1 w-full" style={{ background: 'var(--gradient-brand)' }} />
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Brand */}
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <ChefHat className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-foreground tracking-tight">
                                    Cockpit Executivo
                                </h1>
                                <p className="text-sm text-muted-foreground">Visão Estratégica & Operacional</p>
                            </div>
                        </div>

                        {/* Button Actions */}
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm" onClick={() => router.push('/admin')}>
                                <LogOut className="w-4 h-4 mr-2" />
                                Voltar para Admin
                            </Button>
                        </div>
                    </div>

                    {/* Filter Bar (Inside Header for Sticky effect) */}
                    <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-border/50">
                        <div className="flex items-center gap-3 w-full md:w-auto">

                            {/* Unit Selector */}
                            <div className="relative">
                                <Building2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                                    <SelectTrigger className="w-full md:w-[200px] pl-9 bg-muted/30 border-border/60">
                                        <SelectValue placeholder="Selecione a Unidade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {UNITS.map(u => (
                                            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Period Selector */}
                            <div className="relative">
                                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Select value={period} onValueChange={setPeriod}>
                                    <SelectTrigger className="w-full md:w-[180px] pl-9 bg-muted/30 border-border/60">
                                        <SelectValue placeholder="Período" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="today">Hoje</SelectItem>
                                        <SelectItem value="this_week">Esta Semana</SelectItem>
                                        <SelectItem value="this_month">Este Mês</SelectItem>
                                        <SelectItem value="last_30">Últimos 30 dias</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Export */}
                        <Button variant="ghost" className="text-primary hover:bg-primary/10 w-full md:w-auto">
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
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-8">

                        {/* 2.1 Strategic KPIs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                            {/* Financial */}
                            <Card className="border-border shadow-sm bg-card relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <DollarSign className="w-16 h-16 text-primary" />
                                </div>
                                <CardHeader className="pb-2">
                                    <CardDescription>CMV Projetado (Médio)</CardDescription>
                                    <CardTitle className="text-2xl font-bold flex items-baseline gap-1">
                                        <span className="text-sm font-normal text-muted-foreground">R$</span>
                                        {metrics.financial.cmv.toFixed(2)}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className={metrics.financial.cmv > metrics.financial.target ? "text-destructive font-medium" : "text-primary font-medium"}>
                                            {metrics.financial.cmv > metrics.financial.target ? "+" : "-"}
                                            {Math.abs(metrics.financial.cmv - metrics.financial.target).toFixed(2)}
                                        </span>
                                        <span className="text-muted-foreground">vs Meta (R$ {metrics.financial.target.toFixed(2)})</span>
                                    </div>
                                    <div className="w-full bg-muted/50 h-1.5 mt-3 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${metrics.financial.cmv > metrics.financial.target ? 'bg-destructive' : 'bg-primary'}`}
                                            style={{ width: `${(metrics.financial.cmv / (metrics.financial.target * 1.2)) * 100}%` }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Efficiency */}
                            <Card className="border-border shadow-sm bg-card relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <TrendingDown className="w-16 h-16 text-accent" />
                                </div>
                                <CardHeader className="pb-2">
                                    <CardDescription>Taxa de Rejeição</CardDescription>
                                    <CardTitle className="text-2xl font-bold text-foreground">
                                        {metrics.efficiency.wasteRate.toFixed(1)}%
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Badge variant="secondary" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0">
                                            {metrics.efficiency.wasteCount} cancelados
                                        </Badge>
                                        <span className="text-muted-foreground">no período</span>
                                    </div>
                                    <div className="w-full bg-muted/50 h-1.5 mt-3 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-accent"
                                            style={{ width: `${metrics.efficiency.wasteRate}%` }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Volume */}
                            <Card className="border-border shadow-sm bg-card relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Utensils className="w-16 h-16 text-blue-500" />
                                </div>
                                <CardHeader className="pb-2">
                                    <CardDescription>Refeições Servidas</CardDescription>
                                    <CardTitle className="text-2xl font-bold text-foreground">
                                        {metrics.volume.total}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        <span className="text-muted-foreground">Confirmadas e preparadas</span>
                                    </div>
                                    <div className="w-full bg-muted/50 h-1.5 mt-3 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full bg-blue-500 w-full opacity-50" />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Satisfaction */}
                            <Card className="border-border shadow-sm bg-card relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Award className="w-16 h-16 text-yellow-500" />
                                </div>
                                <CardHeader className="pb-2">
                                    <CardDescription>Índice NPS (Sat)</CardDescription>
                                    <CardTitle className="text-2xl font-bold text-foreground">
                                        {metrics.satisfaction.nps}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-0">
                                            Zona de Qualidade
                                        </Badge>
                                    </div>
                                    <div className="w-full bg-muted/50 h-1.5 mt-3 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-yellow-500"
                                            style={{ width: `${metrics.satisfaction.nps}%` }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 2.2 Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Quality vs Cost */}
                            <Card className="border-border shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-primary" />
                                        Evolução: Custo vs Qualidade
                                    </CardTitle>
                                    <CardDescription>Relação entre investimento por prato e satisfação (30 dias)</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={metrics.charts.trendData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                            <XAxis
                                                dataKey="dateDisplay"
                                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                yAxisId="left"
                                                domain={[10, 15]}
                                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                                label={{ value: 'Custo (R$)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontSize: 12 } }}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                yAxisId="right"
                                                orientation="right"
                                                domain={[0, 5]}
                                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                                label={{ value: 'Nota (0-5)', angle: 90, position: 'insideRight', style: { fill: '#6b7280', fontSize: 12 } }}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                            <Legend />
                                            <Area
                                                yAxisId="left"
                                                type="monotone"
                                                dataKey="cost"
                                                name="Custo Médio (R$)"
                                                fill="var(--accent)"
                                                fillOpacity={0.1}
                                                stroke="var(--accent)"
                                            />
                                            <Line
                                                yAxisId="right"
                                                type="monotone"
                                                dataKey="quality"
                                                name="Qualidade (0-5)"
                                                stroke="var(--primary)"
                                                strokeWidth={3}
                                                dot={{ r: 4, fill: 'var(--primary)' }}
                                            />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Heroes vs Villains */}
                            <Card className="border-border shadow-sm flex flex-col">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Utensils className="w-5 h-5 text-foreground" />
                                        Heróis e Vilões do Cardápio
                                    </CardTitle>
                                    <CardDescription>Top pratos mais pedidos vs mais rejeitados</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col gap-6">

                                    {/* Heroes */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4" /> Campeões de Vendas
                                        </h4>
                                        <div className="space-y-3">
                                            {metrics.charts.topHeroes.map((item: any, idx: number) => (
                                                <div key={idx} className="relative">
                                                    <div className="flex justify-between text-sm mb-1 z-10 relative">
                                                        <span className="font-medium text-foreground">{item.name}</span>
                                                        <span className="font-bold text-primary">{item.confirmed} pedidos</span>
                                                    </div>
                                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary rounded-full transition-all"
                                                            style={{ width: `${(item.confirmed / (metrics.charts.topHeroes[0]?.confirmed || 1)) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            {metrics.charts.topHeroes.length === 0 && <p className="text-sm text-muted-foreground">Sem dados suficientes.</p>}
                                        </div>
                                    </div>

                                    {/* Villains */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-destructive mb-3 flex items-center gap-2">
                                            <TrendingDown className="w-4 h-4" /> Top Rejeição
                                        </h4>
                                        <div className="space-y-3">
                                            {metrics.charts.topVillains.map((item: any, idx: number) => (
                                                <div key={idx} className="relative">
                                                    <div className="flex justify-between text-sm mb-1 z-10 relative">
                                                        <span className="font-medium text-foreground">{item.name}</span>
                                                        <span className="font-bold text-destructive">{item.cancelled} canc.</span>
                                                    </div>
                                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-destructive/80 rounded-full transition-all"
                                                            style={{ width: `${(item.cancelled / (metrics.charts.topVillains[0]?.cancelled || 1)) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            {metrics.charts.topVillains.length === 0 && <p className="text-sm text-muted-foreground">Sem dados suficientes (Nenhum cancelamento).</p>}
                                        </div>
                                    </div>

                                </CardContent>
                            </Card>
                        </div>

                        {/* 2.3 Unit Leaderboard */}
                        <Card className="border-border shadow-sm overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b border-border/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">Ranking de Performance</CardTitle>
                                        <CardDescription>Comparativo de eficiência entre unidades</CardDescription>
                                    </div>
                                    <Button variant="outline" size="sm" disabled>
                                        <Filter className="w-4 h-4 mr-2" />
                                        Mais Filtros
                                    </Button>
                                </div>
                            </CardHeader>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Posição</TableHead>
                                        <TableHead>Unidade</TableHead>
                                        <TableHead className="text-right">Total Pedidos</TableHead>
                                        <TableHead className="text-right">Rejeição</TableHead>
                                        <TableHead className="text-right">Custo Est.</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {metrics.rankings.map((unit: any, idx: number) => (
                                        <TableRow key={unit.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-bold text-sm">
                                                    {idx + 1}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-semibold text-foreground">{unit.name}</div>
                                                <div className="text-xs text-muted-foreground">ID: {unit.id.toUpperCase()}</div>
                                            </TableCell>
                                            <TableCell className="text-right font-bold">{unit.total}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="font-bold text-destructive">{unit.rejected}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {((unit.rejected / (unit.total || 1)) * 100).toFixed(1)}%
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">R$ {unit.cost.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="outline" className={unit.cost > MOCK_TARGET_CMV ? "text-destructive border-destructive/30" : "text-primary border-primary/30"}>
                                                    {unit.cost > MOCK_TARGET_CMV ? "Atenção" : "Regular"}
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
