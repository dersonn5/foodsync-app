'use client'

import { useEffect, useState, useMemo } from 'react'
import { Star, TrendingUp, Award, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
    getFeedbackMetrics,
    getDailyAverages,
    getUnitRankings,
    type FeedbackMetrics as FeedbackMetricsType
} from '@/lib/feedbackService'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface SatisfactionMetricsProps {
    startDate: string
    endDate: string
}

function Loader2({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}

export function SatisfactionMetrics({ startDate, endDate }: SatisfactionMetricsProps) {
    const [loading, setLoading] = useState(true)
    const [metrics, setMetrics] = useState<FeedbackMetricsType | null>(null)
    const [dailyData, setDailyData] = useState<Array<{ date: string; average: number; count: number }>>([])
    const [unitRankings, setUnitRankings] = useState<Array<{ unidade: string; average: number; total: number }>>([])

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            const [metricsData, dailyAvgs, rankings] = await Promise.all([
                getFeedbackMetrics(startDate, endDate),
                getDailyAverages(startDate, endDate),
                getUnitRankings(startDate, endDate)
            ])
            setMetrics(metricsData)
            setDailyData(dailyAvgs)
            setUnitRankings(rankings)
            setLoading(false)
        }
        fetchData()
    }, [startDate, endDate])

    // Calculate NPS-like score (% of 4-5 stars minus % of 1-2 stars)
    const npsScore = useMemo(() => {
        if (!metrics || metrics.totalFeedbacks === 0) return 0
        const total = metrics.totalFeedbacks
        const promoters = (metrics.ratingDistribution[4] + metrics.ratingDistribution[5]) / total * 100
        const detractors = (metrics.ratingDistribution[1] + metrics.ratingDistribution[2]) / total * 100
        return Math.round(promoters - detractors)
    }, [metrics])

    // Color based on NPS
    const npsColor = npsScore >= 50 ? 'text-green-600' : npsScore >= 0 ? 'text-amber-600' : 'text-red-600'
    const npsLabel = npsScore >= 50 ? 'Excelente' : npsScore >= 0 ? 'Bom' : 'Necessita Atenção'

    // Format data for chart
    const chartData = dailyData.map(d => ({
        ...d,
        dateLabel: format(parseISO(d.date), 'dd/MM', { locale: ptBR })
    }))

    const barColors = ['#10b981', '#22c55e', '#4ade80', '#86efac', '#bbf7d0']

    if (loading) {
        return (
            <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6 flex items-center justify-center min-h-[200px]">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                </CardContent>
            </Card>
        )
    }

    if (!metrics || metrics.totalFeedbacks === 0) {
        return (
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-gradient-to-br from-amber-50/50 to-white border-b">
                    <CardTitle className="text-slate-900 flex items-center gap-2 text-md">
                        <Star className="w-5 h-5 text-amber-500" />
                        Métricas de Satisfação
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-center text-slate-400">
                    <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Sem dados de feedback para este período</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Satisfaction KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* NPS Score */}
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Índice de Satisfação</p>
                            <div className="flex items-end gap-2">
                                <span className={`text-3xl font-bold ${npsColor}`}>
                                    {npsScore > 0 ? '+' : ''}{npsScore}
                                </span>
                                <Badge variant="outline" className={`${npsScore >= 50 ? 'bg-green-50 text-green-700 border-green-200' : npsScore >= 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                    {npsLabel}
                                </Badge>
                            </div>
                        </div>
                        <div className={`p-3 rounded-full ${npsScore >= 50 ? 'bg-green-100' : npsScore >= 0 ? 'bg-amber-100' : 'bg-red-100'}`}>
                            <TrendingUp className={`w-6 h-6 ${npsColor}`} />
                        </div>
                    </CardContent>
                </Card>

                {/* Average Rating */}
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Média Geral</p>
                            <div className="flex items-center gap-2">
                                <span className="text-3xl font-bold text-amber-600">
                                    {metrics.averageRating.toFixed(1)}
                                </span>
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-4 h-4 ${star <= Math.round(metrics.averageRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-3 rounded-full bg-amber-100">
                            <Star className="w-6 h-6 text-amber-600" />
                        </div>
                    </CardContent>
                </Card>

                {/* Total Feedbacks */}
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Avaliações Recebidas</p>
                            <span className="text-3xl font-bold text-slate-900">
                                {metrics.totalFeedbacks}
                            </span>
                        </div>
                        <div className="p-3 rounded-full bg-slate-100">
                            <Users className="w-6 h-6 text-slate-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Satisfaction Trend Chart */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-slate-900 flex items-center gap-2 text-md">
                            <TrendingUp className="w-5 h-5 text-amber-500" />
                            Tendência de Satisfação
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        {chartData.length > 0 ? (
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis
                                            dataKey="dateLabel"
                                            tick={{ fontSize: 12 }}
                                            stroke="#94a3b8"
                                        />
                                        <YAxis
                                            domain={[1, 5]}
                                            tick={{ fontSize: 12 }}
                                            stroke="#94a3b8"
                                            ticks={[1, 2, 3, 4, 5]}
                                        />
                                        <Tooltip
                                            formatter={(value) => [typeof value === 'number' ? value.toFixed(2) : value, 'Média']}
                                            labelFormatter={(label) => `Data: ${label}`}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="average"
                                            stroke="#f59e0b"
                                            strokeWidth={3}
                                            dot={{ fill: '#f59e0b', strokeWidth: 2 }}
                                            activeDot={{ r: 6, fill: '#f59e0b' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <p className="text-center text-slate-400 py-8">Sem dados para gráfico</p>
                        )}
                    </CardContent>
                </Card>

                {/* Rating Distribution */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-slate-900 flex items-center gap-2 text-md">
                            <Star className="w-5 h-5 text-amber-500" />
                            Distribuição de Notas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                        {[5, 4, 3, 2, 1].map((rating) => {
                            const count = metrics.ratingDistribution[rating] || 0
                            const percentage = (count / metrics.totalFeedbacks) * 100
                            return (
                                <div key={rating} className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 w-20">
                                        <span className="text-sm font-semibold text-slate-700">{rating}</span>
                                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                    </div>
                                    <div className="flex-1">
                                        <Progress
                                            value={percentage}
                                            className={`h-3 ${rating >= 4 ? '[&>div]:bg-green-500' : rating === 3 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500'}`}
                                        />
                                    </div>
                                    <span className="text-sm text-slate-500 w-16 text-right">
                                        {count} ({percentage.toFixed(0)}%)
                                    </span>
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            </div>

            {/* Unit Rankings */}
            {unitRankings.length > 1 && (
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-slate-900 flex items-center gap-2 text-md">
                            <Award className="w-5 h-5 text-green-500" />
                            Ranking de Unidades
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={unitRankings} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis
                                        type="number"
                                        domain={[0, 5]}
                                        tick={{ fontSize: 12 }}
                                        stroke="#94a3b8"
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="unidade"
                                        tick={{ fontSize: 12 }}
                                        stroke="#94a3b8"
                                        width={120}
                                    />
                                    <Tooltip
                                        formatter={(value) => [typeof value === 'number' ? value.toFixed(2) : value, 'Média']}
                                    />
                                    <Bar dataKey="average" radius={[0, 4, 4, 0]}>
                                        {unitRankings.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={barColors[index % barColors.length]}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
