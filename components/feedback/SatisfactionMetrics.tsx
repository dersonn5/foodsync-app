'use client'

import { useEffect, useState, useMemo } from 'react'
import { Star, TrendingUp, Award, Users, Smile, Meh, Frown } from 'lucide-react'
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

    // NPS visual helpers
    const npsIcon = npsScore >= 50 ? <Smile className="w-6 h-6 text-white" /> : npsScore >= 0 ? <Meh className="w-6 h-6 text-white" /> : <Frown className="w-6 h-6 text-white" />
    const npsLabel = npsScore >= 50 ? 'Excelente' : npsScore >= 0 ? 'Bom' : 'Necessita Atenção'
    const npsBadgeClass = npsScore >= 50
        ? 'bg-brand-50 text-brand-800 border-brand-200/50'
        : npsScore >= 0
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : 'bg-red-50 text-red-700 border-red-200'
    const npsIconBg = npsScore >= 50
        ? { backgroundColor: '#0F2A1D' }
        : npsScore >= 0
            ? { backgroundColor: '#92400e' }
            : { backgroundColor: '#991b1b' }

    // Format data for chart
    const chartData = dailyData.map(d => ({
        ...d,
        dateLabel: format(parseISO(d.date), 'dd/MM', { locale: ptBR })
    }))

    const barColors = ['#0F2A1D', '#233F28', '#375534', '#517252', '#6B9071']

    if (loading) {
        return (
            <Card className="border border-slate-200/60 shadow-sm bg-white/60 backdrop-blur-xl rounded-2xl">
                <CardContent className="p-6 flex items-center justify-center min-h-[200px]">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-800" />
                </CardContent>
            </Card>
        )
    }

    if (!metrics || metrics.totalFeedbacks === 0) {
        return (
            <Card className="border border-slate-200/60 shadow-sm bg-white/60 backdrop-blur-xl rounded-2xl overflow-hidden">
                <CardHeader className="bg-white/40 border-b border-slate-200/60 pb-3">
                    <CardTitle className="flex items-center gap-2 text-md font-semibold" style={{ color: '#0F2A1D' }}>
                        <div className="p-1.5 rounded-lg" style={{ backgroundColor: '#0F2A1D' }}>
                            <Star className="w-4 h-4 text-white" />
                        </div>
                        Métricas de Satisfação
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-center" style={{ color: '#517252' }}>
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
                <Card className="border border-slate-200/60 shadow-sm bg-white/60 backdrop-blur-xl hover:bg-white/70 hover:shadow-md transition-all overflow-hidden rounded-2xl">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: '#517252' }}>Índice de Satisfação</p>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold" style={{ color: '#0F2A1D' }}>
                                    {npsScore > 0 ? '+' : ''}{npsScore}
                                </span>
                                <Badge variant="outline" className={npsBadgeClass}>
                                    {npsLabel}
                                </Badge>
                            </div>
                        </div>
                        <div className="p-3 rounded-xl shadow-md" style={npsIconBg}>
                            {npsIcon}
                        </div>
                    </CardContent>
                </Card>

                {/* Average Rating */}
                <Card className="border border-slate-200/60 shadow-sm bg-white/60 backdrop-blur-xl hover:bg-white/70 hover:shadow-md transition-all overflow-hidden rounded-2xl">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: '#517252' }}>Média Geral</p>
                            <div className="flex items-center gap-2">
                                <span className="text-3xl font-bold" style={{ color: '#0F2A1D' }}>
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
                        <div className="p-3 rounded-xl shadow-md" style={{ backgroundColor: '#0F2A1D' }}>
                            <Star className="w-6 h-6 text-white" />
                        </div>
                    </CardContent>
                </Card>

                {/* Total Feedbacks */}
                <Card className="border border-slate-200/60 shadow-sm bg-white/60 backdrop-blur-xl hover:bg-white/70 hover:shadow-md transition-all overflow-hidden rounded-2xl">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: '#517252' }}>Avaliações Recebidas</p>
                            <span className="text-3xl font-bold" style={{ color: '#0F2A1D' }}>
                                {metrics.totalFeedbacks}
                            </span>
                        </div>
                        <div className="p-3 rounded-xl shadow-md" style={{ backgroundColor: '#0F2A1D' }}>
                            <Users className="w-6 h-6 text-white" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Satisfaction Trend Chart */}
                <Card className="border border-slate-200/60 shadow-sm bg-white/60 backdrop-blur-xl rounded-2xl overflow-hidden">
                    <CardHeader className="bg-white/40 border-b border-slate-200/60 pb-3">
                        <CardTitle className="flex items-center gap-2 text-md font-semibold" style={{ color: '#0F2A1D' }}>
                            <div className="p-1.5 rounded-lg" style={{ backgroundColor: '#0F2A1D' }}>
                                <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                            Tendência de Satisfação
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        {chartData.length > 0 ? (
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E3EED4" />
                                        <XAxis
                                            dataKey="dateLabel"
                                            tick={{ fontSize: 12, fill: '#517252' }}
                                            stroke="#AEC3B0"
                                        />
                                        <YAxis
                                            domain={[1, 5]}
                                            tick={{ fontSize: 12, fill: '#517252' }}
                                            stroke="#AEC3B0"
                                            ticks={[1, 2, 3, 4, 5]}
                                        />
                                        <Tooltip
                                            formatter={(value) => [typeof value === 'number' ? value.toFixed(2) : value, 'Média']}
                                            labelFormatter={(label) => `Data: ${label}`}
                                            contentStyle={{ borderRadius: '12px', border: '1px solid #E3EED4', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="average"
                                            stroke="#375534"
                                            strokeWidth={3}
                                            dot={{ fill: '#0F2A1D', strokeWidth: 2, stroke: '#375534' }}
                                            activeDot={{ r: 6, fill: '#0F2A1D' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <p className="text-center py-8" style={{ color: '#517252' }}>Sem dados para gráfico</p>
                        )}
                    </CardContent>
                </Card>

                {/* Rating Distribution */}
                <Card className="border border-slate-200/60 shadow-sm bg-white/60 backdrop-blur-xl rounded-2xl overflow-hidden">
                    <CardHeader className="bg-white/40 border-b border-slate-200/60 pb-3">
                        <CardTitle className="flex items-center gap-2 text-md font-semibold" style={{ color: '#0F2A1D' }}>
                            <div className="p-1.5 rounded-lg" style={{ backgroundColor: '#0F2A1D' }}>
                                <Star className="w-4 h-4 text-white" />
                            </div>
                            Distribuição de Notas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 space-y-3.5">
                        {[5, 4, 3, 2, 1].map((rating) => {
                            const count = metrics.ratingDistribution[rating] || 0
                            const percentage = (count / metrics.totalFeedbacks) * 100
                            const barColor = rating >= 4 ? '[&>div]:bg-[#375534]' : rating === 3 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500'
                            return (
                                <div key={rating} className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 w-12 shrink-0">
                                        <span className="text-sm font-semibold" style={{ color: '#0F2A1D' }}>{rating}</span>
                                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                    </div>
                                    <div className="flex-1">
                                        <Progress
                                            value={percentage}
                                            className={`h-3 bg-slate-100/60 rounded-full ${barColor}`}
                                        />
                                    </div>
                                    <span className="text-sm w-20 text-right shrink-0" style={{ color: '#517252' }}>
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
                <Card className="border border-slate-200/60 shadow-sm bg-white/60 backdrop-blur-xl rounded-2xl overflow-hidden">
                    <CardHeader className="bg-white/40 border-b border-slate-200/60 pb-3">
                        <CardTitle className="flex items-center gap-2 text-md font-semibold" style={{ color: '#0F2A1D' }}>
                            <div className="p-1.5 rounded-lg" style={{ backgroundColor: '#0F2A1D' }}>
                                <Award className="w-4 h-4 text-white" />
                            </div>
                            Ranking de Unidades
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={unitRankings} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E3EED4" />
                                    <XAxis
                                        type="number"
                                        domain={[0, 5]}
                                        tick={{ fontSize: 12, fill: '#517252' }}
                                        stroke="#AEC3B0"
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="unidade"
                                        tick={{ fontSize: 12, fill: '#0F2A1D' }}
                                        stroke="#AEC3B0"
                                        width={120}
                                    />
                                    <Tooltip
                                        formatter={(value) => [typeof value === 'number' ? value.toFixed(2) : value, 'Média']}
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #E3EED4', backgroundColor: 'rgba(255,255,255,0.9)' }}
                                    />
                                    <Bar dataKey="average" radius={[0, 8, 8, 0]}>
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
