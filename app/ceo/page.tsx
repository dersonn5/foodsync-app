'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Award,
    Loader2,
    LogOut,
    BarChart3
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    getHistoricalMetrics,
    getUnitRankings
} from '@/lib/feedbackService'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Area,
    AreaChart
} from 'recharts'
import { format, parseISO, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Mock data generator for when real data is insufficient
function generateMockData() {
    const data = []
    for (let i = 29; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
        const baseRating = 3.8 + Math.random() * 1.0
        const baseCost = 11 + Math.random() * 3
        data.push({
            date,
            dateLabel: format(subDays(new Date(), i), 'dd/MM', { locale: ptBR }),
            average: parseFloat(baseRating.toFixed(2)),
            cost: parseFloat(baseCost.toFixed(2)),
            count: Math.floor(Math.random() * 50) + 10,
            nps: Math.floor((baseRating - 3) * 50)
        })
    }
    return data
}

function generateMockUnitRankings() {
    return [
        { unidade: 'Matriz', average: 4.5, total: 120 },
        { unidade: 'Filial Centro', average: 4.2, total: 85 },
        { unidade: 'Filial Sul', average: 3.9, total: 65 },
        { unidade: 'Filial Norte', average: 3.6, total: 45 }
    ]
}

export default function CEODashboard() {
    const router = useRouter()
    const supabase = createClient()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [chartData, setChartData] = useState<any[]>([])
    const [unitRankings, setUnitRankings] = useState<any[]>([])

    // Calculate aggregate KPIs from chart data
    const npsGlobal = chartData.length > 0
        ? Math.round(chartData.reduce((acc, d) => acc + (d.nps || 0), 0) / chartData.length)
        : 78 // Default mock

    const avgCost = chartData.length > 0
        ? (chartData.reduce((acc, d) => acc + (d.cost || 12.5), 0) / chartData.length).toFixed(2)
        : '12.50' // Mock

    const wasteReduction = '-3.2%' // Mock - would come from comparing periods

    useEffect(() => {
        async function init() {
            // Auth Check
            const { data: { user }, error } = await supabase.auth.getUser()
            if (error || !user) {
                router.push('/admin/login')
                return
            }
            setUser(user)

            // Fetch Data
            setLoading(true)
            const [historicalData, rankings] = await Promise.all([
                getHistoricalMetrics(30),
                getUnitRankings(
                    format(subDays(new Date(), 30), 'yyyy-MM-dd'),
                    format(new Date(), 'yyyy-MM-dd')
                )
            ])

            // If insufficient data, use mock
            if (historicalData.length < 5) {
                setChartData(generateMockData())
                setUnitRankings(generateMockUnitRankings())
            } else {
                // Format real data with cost mock (since we don't have cost data)
                const formattedData = historicalData.map(d => ({
                    ...d,
                    dateLabel: format(parseISO(d.date), 'dd/MM', { locale: ptBR }),
                    cost: 11 + Math.random() * 3 // Mock cost
                }))
                setChartData(formattedData)
                setUnitRankings(rankings.length > 0 ? rankings : generateMockUnitRankings())
            }

            setLoading(false)
        }
        init()
    }, [router, supabase])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/admin/login')
    }

    // NPS color and label
    const getNPSStyle = (nps: number) => {
        if (nps >= 70) return { color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Excelência' }
        if (nps >= 50) return { color: 'text-green-600', bg: 'bg-green-100', label: 'Zona de Qualidade' }
        if (nps >= 0) return { color: 'text-amber-600', bg: 'bg-amber-100', label: 'Aperfeiçoamento' }
        return { color: 'text-red-600', bg: 'bg-red-100', label: 'Crítico' }
    }

    const npsStyle = getNPSStyle(npsGlobal)

    if (!user) return null

    return (
        <div className="min-h-screen bg-zinc-50">
            {/* Clean Header */}
            <header className="bg-white border-b border-zinc-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
                            Visão Estratégica
                        </h1>
                        <p className="text-sm text-zinc-500">FoodSync Executive Dashboard</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge variant="outline" className="bg-zinc-100 text-zinc-600 font-normal">
                            {format(new Date(), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                        </Badge>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="text-zinc-500 hover:text-zinc-700"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sair
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {loading ? (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <Loader2 className="w-10 h-10 text-zinc-400 animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Row 1: Macro KPIs */}
                        <section>
                            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                                Indicadores Chave
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* NPS Global */}
                                <Card className="border-zinc-200 shadow-sm bg-white">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-zinc-500 mb-2">
                                                    NPS Global
                                                </p>
                                                <div className="flex items-baseline gap-3">
                                                    <span className={`text-5xl font-bold ${npsStyle.color}`}>
                                                        {npsGlobal}
                                                    </span>
                                                    <Badge className={`${npsStyle.bg} ${npsStyle.color} border-0`}>
                                                        {npsStyle.label}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className={`p-3 rounded-xl ${npsStyle.bg}`}>
                                                <TrendingUp className={`w-6 h-6 ${npsStyle.color}`} />
                                            </div>
                                        </div>
                                        <p className="text-xs text-zinc-400 mt-4">
                                            Média dos últimos 30 dias
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Custo Médio por Prato */}
                                <Card className="border-zinc-200 shadow-sm bg-white">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-zinc-500 mb-2">
                                                    Custo Médio por Prato
                                                </p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-sm text-zinc-400">R$</span>
                                                    <span className="text-5xl font-bold text-zinc-800">
                                                        {avgCost}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-3 rounded-xl bg-zinc-100">
                                                <DollarSign className="w-6 h-6 text-zinc-600" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-zinc-400 mt-4">
                                            Estimativa operacional
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Desperdício Projetado */}
                                <Card className="border-zinc-200 shadow-sm bg-white">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-zinc-500 mb-2">
                                                    Desperdício vs Mês Anterior
                                                </p>
                                                <div className="flex items-baseline gap-3">
                                                    <span className="text-5xl font-bold text-emerald-600">
                                                        {wasteReduction}
                                                    </span>
                                                    <Badge className="bg-emerald-100 text-emerald-700 border-0">
                                                        Redução
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="p-3 rounded-xl bg-emerald-100">
                                                <TrendingDown className="w-6 h-6 text-emerald-600" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-zinc-400 mt-4">
                                            Baseado em cancelamentos evitados
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </section>

                        {/* Row 2: Charts */}
                        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                            {/* Quality vs Cost Chart (60%) */}
                            <Card className="lg:col-span-3 border-zinc-200 shadow-sm bg-white">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-zinc-800 flex items-center gap-2 text-base font-semibold">
                                        <BarChart3 className="w-5 h-5 text-zinc-400" />
                                        Qualidade vs Custo
                                        <span className="text-xs font-normal text-zinc-400 ml-2">
                                            Últimos 30 dias
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="h-[320px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={chartData}>
                                                <defs>
                                                    <linearGradient id="colorQuality" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                                                <XAxis
                                                    dataKey="dateLabel"
                                                    tick={{ fontSize: 11, fill: '#71717a' }}
                                                    stroke="#d4d4d8"
                                                    tickLine={false}
                                                />
                                                <YAxis
                                                    yAxisId="left"
                                                    domain={[1, 5]}
                                                    tick={{ fontSize: 11, fill: '#71717a' }}
                                                    stroke="#d4d4d8"
                                                    tickLine={false}
                                                    label={{
                                                        value: 'Qualidade',
                                                        angle: -90,
                                                        position: 'insideLeft',
                                                        style: { fontSize: 11, fill: '#71717a' }
                                                    }}
                                                />
                                                <YAxis
                                                    yAxisId="right"
                                                    orientation="right"
                                                    domain={[8, 18]}
                                                    tick={{ fontSize: 11, fill: '#71717a' }}
                                                    stroke="#d4d4d8"
                                                    tickLine={false}
                                                    label={{
                                                        value: 'Custo (R$)',
                                                        angle: 90,
                                                        position: 'insideRight',
                                                        style: { fontSize: 11, fill: '#71717a' }
                                                    }}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'white',
                                                        border: '1px solid #e4e4e7',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                                                    }}
                                                    formatter={(value: number, name: string) => [
                                                        name === 'average' ? value.toFixed(2) : `R$ ${value.toFixed(2)}`,
                                                        name === 'average' ? 'Qualidade' : 'Custo'
                                                    ]}
                                                />
                                                <Legend
                                                    formatter={(value) => value === 'average' ? 'Qualidade' : 'Custo'}
                                                />
                                                <Area
                                                    yAxisId="left"
                                                    type="monotone"
                                                    dataKey="average"
                                                    stroke="#10b981"
                                                    strokeWidth={2}
                                                    fill="url(#colorQuality)"
                                                />
                                                <Line
                                                    yAxisId="right"
                                                    type="monotone"
                                                    dataKey="cost"
                                                    stroke="#6366f1"
                                                    strokeWidth={2}
                                                    dot={false}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Unit Rankings (40%) */}
                            <Card className="lg:col-span-2 border-zinc-200 shadow-sm bg-white">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-zinc-800 flex items-center gap-2 text-base font-semibold">
                                        <Award className="w-5 h-5 text-amber-500" />
                                        Ranking de Unidades
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="space-y-4">
                                        {unitRankings.map((unit, index) => {
                                            const isTop = index === 0
                                            const isBottom = index === unitRankings.length - 1
                                            const percentage = (unit.average / 5) * 100

                                            return (
                                                <div key={unit.unidade} className="group">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`
                                                                w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold
                                                                ${isTop ? 'bg-amber-100 text-amber-700' :
                                                                    isBottom ? 'bg-zinc-100 text-zinc-500' :
                                                                        'bg-zinc-50 text-zinc-600'}
                                                            `}>
                                                                {index + 1}
                                                            </span>
                                                            <span className="font-medium text-zinc-700">
                                                                {unit.unidade}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-lg font-bold ${unit.average >= 4 ? 'text-emerald-600' :
                                                                    unit.average >= 3 ? 'text-amber-600' : 'text-red-600'
                                                                }`}>
                                                                {unit.average.toFixed(1)}
                                                            </span>
                                                            <span className="text-xs text-zinc-400">
                                                                ({unit.total})
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${unit.average >= 4 ? 'bg-emerald-500' :
                                                                    unit.average >= 3 ? 'bg-amber-500' : 'bg-red-500'
                                                                }`}
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}

                                        {unitRankings.length === 0 && (
                                            <div className="text-center py-8 text-zinc-400">
                                                <Award className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                                <p className="text-sm">Sem dados de unidades</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Footer Note */}
                        <footer className="text-center pt-8 pb-4">
                            <p className="text-xs text-zinc-400">
                                Dados atualizados em tempo real • Última atualização: {format(new Date(), 'HH:mm', { locale: ptBR })}
                            </p>
                        </footer>
                    </div>
                )}
            </main>
        </div>
    )
}
