'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, isWithinInterval, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    CheckCircle2,
    Utensils,
    Download,
    Calendar,
    ChefHat,
    XCircle,
    Loader2
} from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { SatisfactionMetrics } from '@/components/feedback/SatisfactionMetrics'

export default function ReportsPage() {
    const supabase = createClient()
    const [period, setPeriod] = useState('week') // week | month | last_month
    const [loading, setLoading] = useState(true)
    const [rawData, setRawData] = useState<any[]>([])

    // Date Range Calculation
    const { start, end } = useMemo(() => {
        const now = new Date()
        if (period === 'month') return { start: startOfMonth(now), end: endOfMonth(now) }
        if (period === 'last_month') {
            const last = subMonths(now, 1)
            return { start: startOfMonth(last), end: endOfMonth(last) }
        }
        return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) }
    }, [period])

    // Fetch Data (Last 100 Orders - Client Side Filter)
    useEffect(() => {
        async function fetchData() {
            setLoading(true)

            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id,
                    status,
                    consumption_date,
                    menu_item:menu_items (
                        name
                    )
                `)
                .order('consumption_date', { ascending: false })
                .limit(1000)

            if (data) {
                console.log("📊 Relatórios - Dados Brutos:", data.length, "pedidos encontrados.")
                if (data.length > 0) {
                    console.log("Exemplo de data (consumption_date):", data[0]?.consumption_date)
                    console.log("Exemplo de status:", data[0]?.status)
                }
                setRawData(data)
            } else if (error) {
                console.error("Erro ao buscar relatórios:", error)
            }

            setLoading(false)
        }
        fetchData()
    }, [supabase])

    // Metrics Calculation (Client-Side Filtering)
    const metrics = useMemo(() => {
        // 1. Filter by Date Range (Javascript is safer for timezones)
        const periodOrders = rawData.filter(o => {
            if (!o.consumption_date) return false
            const orderDate = parseISO(o.consumption_date)
            return isWithinInterval(orderDate, { start, end })
        })

        console.log(`🔎 Filtrando: ${periodOrders.length} pedidos dentro do período selecionado (${period}).`)

        const totalOrders = periodOrders.length
        if (totalOrders === 0) return null

        // 2. Normalize Status (Resilience)
        const isCancelled = (status: string) => {
            const s = (status || '').toLowerCase().trim()
            return s === 'cancelled' || s === 'canceled'
        }

        const confirmed = periodOrders.filter(o =>
            o.status && !isCancelled(o.status)
        )
        const cancelled = periodOrders.filter(o =>
            o.status && isCancelled(o.status)
        )

        const efficiency = (confirmed.length / totalOrders) * 100
        const wasteCount = cancelled.length

        // 3. Group by Item
        const itemStats: Record<string, { name: string, total: number, cancelled: number, confirmed: number }> = {}

        periodOrders.forEach(order => {
            const itemName = order.menu_item?.name || 'Prato Desconhecido'
            if (!itemStats[itemName]) {
                itemStats[itemName] = { name: itemName, total: 0, cancelled: 0, confirmed: 0 }
            }
            itemStats[itemName].total += 1

            const statusCancelled = isCancelled(order.status)
            if (statusCancelled) itemStats[itemName].cancelled += 1
            else itemStats[itemName].confirmed += 1
        })

        const sortedRejection = Object.values(itemStats)
            .filter(i => i.cancelled > 0)
            .sort((a, b) => b.cancelled - a.cancelled)

        const sortedProduction = Object.values(itemStats)
            .filter(i => i.confirmed > 0)
            .sort((a, b) => b.confirmed - a.confirmed)

        return {
            efficiency,
            wasteCount,
            productionTotal: confirmed.length,
            rejectionList: sortedRejection,
            productionList: sortedProduction
        }
    }, [rawData, start, end, period])

    return (
        <div className="min-h-screen flex flex-col p-4 pb-32 gap-6 md:p-6 md:pb-8 bg-transparent">

            {/* Header - Premium Styling */}
            <div className="flex-none flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-brand-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-brand-800 to-brand-700 shadow-lg shadow-brand-900/20">
                            <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        Relatórios de Eficiência
                    </h1>
                    <p className="text-brand-600 text-sm ml-[52px]">
                        Controle de desperdício e planejamento de produção.
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-full md:w-[180px] bg-white/60 backdrop-blur-xl border-slate-200/60 rounded-xl shadow-sm focus:ring-brand-800 text-brand-900">
                            <Calendar className="w-4 h-4 mr-2 text-brand-700" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border border-slate-200/60 bg-white/90 backdrop-blur-xl">
                            <SelectItem value="week">Esta Semana</SelectItem>
                            <SelectItem value="month">Este Mês</SelectItem>
                            <SelectItem value="last_month">Mês Passado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-brand-800 animate-spin" />
                </div>
            ) : metrics ? (
                <>
                    {/* KPIs - Premium Design */}
                    <div className="flex-none grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border border-slate-200/60 shadow-sm bg-white/60 backdrop-blur-xl hover:bg-white/70 hover:shadow-md transition-all overflow-hidden rounded-2xl">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-brand-600 uppercase tracking-wider mb-1">Taxa de Eficiência</p>
                                    <div className="flex items-end gap-2">
                                        <span className={`text-3xl font-bold ${metrics.efficiency >= 90 ? 'text-brand-900' : 'text-amber-600'}`}>
                                            {metrics.efficiency.toFixed(1)}%
                                        </span>
                                        <Badge variant="outline" className={metrics.efficiency >= 90 ? 'bg-brand-50 text-brand-800 border-brand-200/50' : 'bg-amber-50 text-amber-700 border-amber-200'}>
                                            {metrics.efficiency >= 90 ? 'Excelente' : 'Atenção'}
                                        </Badge>
                                    </div>
                                </div>
                                <div className={`p-3 rounded-xl shadow-md ${metrics.efficiency >= 90 ? 'bg-gradient-to-br from-brand-800 to-brand-700 shadow-brand-900/20' : 'bg-amber-100 shadow-amber-500/10'}`}>
                                    {metrics.efficiency >= 90 ? <TrendingUp className="w-6 h-6 text-white" /> : <AlertCircle className="w-6 h-6 text-amber-600" />}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-slate-200/60 shadow-sm bg-white/60 backdrop-blur-xl hover:bg-white/70 hover:shadow-md transition-all overflow-hidden rounded-2xl">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-brand-600 uppercase tracking-wider mb-1">Desperdício Evitado</p>
                                    <div className="flex items-end gap-2">
                                        <span className="text-3xl font-bold text-brand-900">
                                            {metrics.wasteCount}
                                        </span>
                                        <span className="text-sm text-brand-600 mb-1">itens cancelados</span>
                                    </div>
                                </div>
                                <div className="p-3 rounded-xl bg-red-50/80">
                                    <XCircle className="w-6 h-6 text-red-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-slate-200/60 shadow-sm bg-white/60 backdrop-blur-xl hover:bg-white/70 hover:shadow-md transition-all overflow-hidden rounded-2xl">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-brand-600 uppercase tracking-wider mb-1">Produção Total</p>
                                    <div className="flex items-end gap-2">
                                        <span className="text-3xl font-bold text-brand-900">
                                            {metrics.productionTotal}
                                        </span>
                                        <span className="text-sm text-brand-600 mb-1">pratos a servir</span>
                                    </div>
                                </div>
                                <div className="p-3 rounded-xl bg-gradient-to-br from-brand-800 to-brand-700 shadow-md shadow-brand-900/20">
                                    <ChefHat className="w-6 h-6 text-white" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Split Grid (Mobile: Stack / Desktop: Grid) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Radar de Rejeição */}
                        <Card className="flex flex-col border border-slate-200/60 shadow-sm min-h-[300px] bg-white/60 backdrop-blur-xl rounded-2xl overflow-hidden">
                            <CardHeader className="bg-white/40 border-b border-slate-200/60 pb-3">
                                <CardTitle className="text-brand-900 flex items-center gap-2 text-md font-semibold">
                                    <div className="p-1.5 rounded-lg bg-red-50/80">
                                        <TrendingDown className="w-4 h-4 text-red-500" />
                                    </div>
                                    Radar de Rejeição
                                    <span className="text-[10px] font-medium text-red-600 ml-auto bg-red-50/80 px-2 py-1 rounded-md">Top Cancelamentos</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-brand-100">
                                {metrics.rejectionList.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-brand-600 p-6">
                                        <CheckCircle2 className="w-12 h-12 mb-2 text-brand-300" />
                                        <p>Sem cancelamentos no período!</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100/50">
                                        {metrics.rejectionList.map((item, idx) => (
                                            <div key={item.name} className="p-4 hover:bg-white/40 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-medium text-brand-900 text-sm">
                                                        {idx + 1}. {item.name}
                                                    </span>
                                                    <Badge variant="secondary" className="bg-destructive/10 text-destructive hover:bg-destructive/15">
                                                        {item.cancelled} un
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Progress value={(item.cancelled / item.total) * 100} className="h-2 bg-slate-100/50 [&>div]:bg-red-500" />
                                                    <span className="text-xs text-brand-600 w-12 text-right">
                                                        {Math.round((item.cancelled / item.total) * 100)}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Guia de Produção */}
                        <Card className="flex flex-col border border-slate-200/60 bg-white/60 backdrop-blur-xl rounded-2xl shadow-sm min-h-[300px] overflow-hidden">
                            <CardHeader className="bg-white/40 border-b border-slate-200/60 pb-3 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-brand-900 flex items-center gap-2 text-md font-semibold">
                                    <div className="p-1.5 rounded-lg bg-brand-50/50">
                                        <Utensils className="w-4 h-4 text-brand-800" />
                                    </div>
                                    Guia de Produção
                                </CardTitle>
                                <Button size="sm" variant="ghost" className="h-8 text-brand-800 hover:text-brand-900 hover:bg-white/60">
                                    <Download className="w-4 h-4 mr-1" />
                                    PDF
                                </Button>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-brand-100">
                                <div className="divide-y divide-slate-100/50">
                                    {metrics.productionList.map((item, idx) => (
                                        <div key={item.name} className="p-4 flex items-center justify-between hover:bg-white/40 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-brand-50/50 flex items-center justify-center text-brand-800 font-bold text-xs border border-brand-100/30">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-brand-900 text-sm">{item.name}</p>
                                                    <p className="text-xs text-brand-600">Total Confirmado</p>
                                                </div>
                                            </div>
                                            <span className="text-lg font-bold text-brand-900">
                                                {item.confirmed} <span className="text-xs font-normal text-brand-600">un</span>
                                            </span>
                                        </div>
                                    ))}
                                    {metrics.productionList.length === 0 && (
                                        <div className="p-8 text-center text-brand-600 text-sm">
                                            Nenhum pedido confirmado para produzir.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* CEO Satisfaction Metrics Section */}
                    <div className="mt-6">
                        <h2 className="text-xl font-bold text-brand-900 mb-4 flex items-center gap-2">
                            Métricas de Satisfação
                        </h2>
                        <SatisfactionMetrics
                            startDate={format(start, 'yyyy-MM-dd')}
                            endDate={format(end, 'yyyy-MM-dd')}
                        />
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-brand-600 gap-2 font-medium">
                    <p>Sem dados para o período!</p>
                    <p className="text-xs text-brand-400">
                        ({rawData.length} pedidos encontrados no total, mas {rawData.length > 0 ? 'nenhum neste range' : 'banco vazio'})
                    </p>
                </div>
            )}
        </div>
    )
}
