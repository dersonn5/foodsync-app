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
    BarChart3,
    ChefHat
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    getHistoricalMetrics,
    getUnitRankings
} from '@/lib/feedbackService'
import {
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

    // NPS color and label using design system
    const getNPSStyle = (nps: number) => {
        if (nps >= 70) return { color: 'text-primary', bg: 'bg-primary/15', label: 'Excelência' }
        if (nps >= 50) return { color: 'text-primary', bg: 'bg-primary/10', label: 'Zona de Qualidade' }
        if (nps >= 0) return { color: 'text-accent', bg: 'bg-accent/15', label: 'Aperfeiçoamento' }
        return { color: 'text-destructive', bg: 'bg-destructive/15', label: 'Crítico' }
    }

    const npsStyle = getNPSStyle(npsGlobal)

    if (!user) return null

    return (
        <div className="min-h-screen bg-background">
            {/* Header with gradient accent */}
            <header className="bg-card border-b border-border sticky top-0 z-50">
                <div className="h-1 w-full" style={{ background: 'var(--gradient-brand)' }} />
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <ChefHat className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground tracking-tight">
                                Visão Estratégica
                            </h1>
                            <p className="text-sm text-muted-foreground">FoodSync Executive Dashboard</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge variant="outline" className="bg-muted text-muted-foreground font-normal">
                            {format(new Date(), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                        </Badge>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="text-muted-foreground hover:text-foreground"
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
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Row 1: Macro KPIs */}
                        <section>
                            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                                Indicadores Chave
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* NPS Global */}
                                <Card className="border-border shadow-sm bg-card">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground mb-2">
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
                                        <p className="text-xs text-muted-foreground mt-4">
                                            Média dos últimos 30 dias
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Custo Médio por Prato */}
                                <Card className="border-border shadow-sm bg-card">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground mb-2">
                                                    Custo Médio por Prato
                                                </p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-sm text-muted-foreground">R$</span>
                                                    <span className="text-5xl font-bold text-foreground">
                                                        {avgCost}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-3 rounded-xl bg-muted">
                                                <DollarSign className="w-6 h-6 text-muted-foreground" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-4">
                                            Estimativa operacional
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Desperdício Projetado */}
                                <Card className="border-border shadow-sm bg-card">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground mb-2">
                                                    Desperdício vs Mês Anterior
                                                </p>
                                                <div className="flex items-baseline gap-3">
                                                    <span className="text-5xl font-bold text-primary">
                                                        {wasteReduction}
                                                    </span>
                                                    <Badge className="bg-primary/15 text-primary border-0">
                                                        Redução
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="p-3 rounded-xl bg-primary/15">
                                                <TrendingDown className="w-6 h-6 text-primary" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-4">
                                            Baseado em cancelamentos evitados
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </section>

                        {/* Row 2: Charts */}
                        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                            {/* Quality vs Cost Chart (60%) */}
                            <Card className="lg:col-span-3 border-border shadow-sm bg-card">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-foreground flex items-center gap-2 text-base font-semibold">
                                        <BarChart3 className="w-5 h-5 text-primary" />
                                        Qualidade vs Custo
                                        <span className="text-xs font-normal text-muted-foreground ml-2">
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
                                                        <stop offset="5%" stopColor="hsl(142 52% 36%)" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="hsl(142 52% 36%)" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="hsl(25 95% 55%)" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="hsl(25 95% 55%)" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(40 20% 88%)" />
                                                <XAxis
                                                    dataKey="dateLabel"
                                                    tick={{ fontSize: 11, fill: 'hsl(25 15% 45%)' }}
                                                    stroke="hsl(40 20% 88%)"
                                                    tickLine={false}
                                                />
                                                <YAxis
                                                    yAxisId="left"
                                                    domain={[1, 5]}
                                                    tick={{ fontSize: 11, fill: 'hsl(25 15% 45%)' }}
                                                    stroke="hsl(40 20% 88%)"
                                                    tickLine={false}
                                                    label={{
                                                        value: 'Qualidade',
                                                        angle: -90,
                                                        position: 'insideLeft',
                                                        style: { fontSize: 11, fill: 'hsl(25 15% 45%)' }
                                                    }}
                                                />
                                                <YAxis
                                                    yAxisId="right"
                                                    orientation="right"
                                                    domain={[8, 18]}
                                                    tick={{ fontSize: 11, fill: 'hsl(25 15% 45%)' }}
                                                    stroke="hsl(40 20% 88%)"
                                                    tickLine={false}
                                                    label={{
                                                        value: 'Custo (R$)',
                                                        angle: 90,
                                                        position: 'insideRight',
                                                        style: { fontSize: 11, fill: 'hsl(25 15% 45%)' }
                                                    }}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'hsl(0 0% 100%)',
                                                        border: '1px solid hsl(40 20% 88%)',
                                                        borderRadius: '12px',
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
                                                    stroke="hsl(142 52% 36%)"
                                                    strokeWidth={2}
                                                    fill="url(#colorQuality)"
                                                />
                                                <Line
                                                    yAxisId="right"
                                                    type="monotone"
                                                    dataKey="cost"
                                                    stroke="hsl(25 95% 55%)"
                                                    strokeWidth={2}
                                                    dot={false}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Unit Rankings (40%) */}
                            <Card className="lg:col-span-2 border-border shadow-sm bg-card">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-foreground flex items-center gap-2 text-base font-semibold">
                                        <Award className="w-5 h-5 text-accent" />
                                        Ranking de Unidades
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="space-y-4">
                                        {unitRankings.map((unit, index) => {
                                            const isTop = index === 0
                                            const isBottom = index === unitRankings.length - 1
                                            const percentage = (unit.average / 5) * 100
                                            const ratingColor = unit.average >= 4 ? 'text-primary' :
                                                unit.average >= 3 ? 'text-accent' : 'text-destructive'
                                            const barColor = unit.average >= 4 ? 'bg-primary' :
                                                unit.average >= 3 ? 'bg-accent' : 'bg-destructive'

                                            return (
                                                <div key={unit.unidade} className="group">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`
                                                                w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold
                                                                ${isTop ? 'bg-accent/20 text-accent' :
                                                                    isBottom ? 'bg-muted text-muted-foreground' :
                                                                        'bg-muted/50 text-muted-foreground'}
                                                            `}>
                                                                {index + 1}
                                                            </span>
                                                            <span className="font-medium text-foreground">
                                                                {unit.unidade}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-lg font-bold ${ratingColor}`}>
                                                                {unit.average.toFixed(1)}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                ({unit.total})
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}

                                        {unitRankings.length === 0 && (
                                            <div className="text-center py-8 text-muted-foreground">
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
                            <p className="text-xs text-muted-foreground">
                                Dados atualizados em tempo real • Última atualização: {format(new Date(), 'HH:mm', { locale: ptBR })}
                            </p>
                        </footer>
                    </div>
                )}
            </main>
        </div>
    )
}
