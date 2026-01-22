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
    XCircle
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

    // Fetch Data
    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id,
                    status,
                    total_price,
                    created_at,
                    menu_item:menu_items (
                        id,
                        name,
                        type
                    )
                `)
                .gte('created_at', start.toISOString())
                .lte('created_at', end.toISOString())

            if (data) setRawData(data)
            setLoading(false)
        }
        fetchData()
    }, [start, end, supabase])

    // Metrics Calculation
    const metrics = useMemo(() => {
        const totalOrders = rawData.length
        if (totalOrders === 0) return null

        const confirmed = rawData.filter(o => o.status !== 'cancelled')
        const cancelled = rawData.filter(o => o.status === 'cancelled')

        const efficiency = (confirmed.length / totalOrders) * 100
        const wasteCount = cancelled.length

        // Group by Item for Rejection Radar
        const itemStats: Record<string, { name: string, total: number, cancelled: number, confirmed: number }> = {}

        rawData.forEach(order => {
            const itemName = order.menu_item?.name || 'Item Desconhecido'
            if (!itemStats[itemName]) {
                itemStats[itemName] = { name: itemName, total: 0, cancelled: 0, confirmed: 0 }
            }
            itemStats[itemName].total += 1
            if (order.status === 'cancelled') itemStats[itemName].cancelled += 1
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
    }, [rawData])

    return (
        <div className="h-[calc(100vh-1rem)] flex flex-col overflow-hidden p-6 gap-6 font-sans">

            {/* Header */}
            <div className="flex-none flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-slate-400" />
                        Relatórios de Eficiência
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Controle de desperdício e planejamento de produção.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-[180px] bg-white">
                            <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">Esta Semana</SelectItem>
                            <SelectItem value="month">Este Mês</SelectItem>
                            <SelectItem value="last_month">Mês Passado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
            ) : metrics ? (
                <>
                    {/* KPIs */}
                    <div className="flex-none grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Taxa de Eficiência</p>
                                    <div className="flex items-end gap-2">
                                        <span className={`text-3xl font-bold ${metrics.efficiency >= 90 ? 'text-green-600' : 'text-orange-600'}`}>
                                            {metrics.efficiency.toFixed(1)}%
                                        </span>
                                        <Badge variant="outline" className={metrics.efficiency >= 90 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}>
                                            {metrics.efficiency >= 90 ? 'Excelente' : 'Atenção'}
                                        </Badge>
                                    </div>
                                </div>
                                <div className={`p-3 rounded-full ${metrics.efficiency >= 90 ? 'bg-green-100' : 'bg-orange-100'}`}>
                                    {metrics.efficiency >= 90 ? <TrendingUp className="w-6 h-6 text-green-600" /> : <AlertCircle className="w-6 h-6 text-orange-600" />}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Desperdício Evitado</p>
                                    <div className="flex items-end gap-2">
                                        <span className="text-3xl font-bold text-slate-900">
                                            {metrics.wasteCount}
                                        </span>
                                        <span className="text-sm text-slate-400 mb-1">itens cancelados</span>
                                    </div>
                                </div>
                                <div className="p-3 rounded-full bg-slate-100">
                                    <XCircle className="w-6 h-6 text-slate-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Produção Total</p>
                                    <div className="flex items-end gap-2">
                                        <span className="text-3xl font-bold text-blue-600">
                                            {metrics.productionTotal}
                                        </span>
                                        <span className="text-sm text-slate-400 mb-1">pratos a servir</span>
                                    </div>
                                </div>
                                <div className="p-3 rounded-full bg-blue-100">
                                    <ChefHat className="w-6 h-6 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Split Grid */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">

                        {/* Radar de Rejeição */}
                        <Card className="flex flex-col border-slate-200 shadow-sm overflow-hidden">
                            <CardHeader className="bg-red-50/30 border-b border-red-100 pb-3">
                                <CardTitle className=" text-red-900 flex items-center gap-2 text-md">
                                    <TrendingDown className="w-5 h-5" />
                                    Radar de Rejeição
                                    <span className="text-xs font-normal text-red-600 ml-auto bg-red-100 px-2 py-1 rounded-full">Top Cancelamentos</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-0">
                                {metrics.rejectionList.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6">
                                        <CheckCircle2 className="w-12 h-12 mb-2 text-green-200" />
                                        <p>Sem cancelamentos no período!</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {metrics.rejectionList.map((item, idx) => (
                                            <div key={item.name} className="p-4 hover:bg-slate-50 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-medium text-slate-700 text-sm">
                                                        {idx + 1}. {item.name}
                                                    </span>
                                                    <Badge variant="secondary" className="bg-red-50 text-red-700 hover:bg-red-100">
                                                        {item.cancelled} un
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Progress value={(item.cancelled / item.total) * 100} className="h-2 bg-slate-100" indicatorColor="bg-red-500" />
                                                    <span className="text-xs text-slate-500 w-12 text-right">
                                                        {Math.round((item.cancelled / item.total) * 100)}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Guia de Compras */}
                        <Card className="flex flex-col border-slate-200 shadow-sm overflow-hidden">
                            <CardHeader className="bg-blue-50/30 border-b border-blue-100 pb-3 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-blue-900 flex items-center gap-2 text-md">
                                    <Utensils className="w-5 h-5" />
                                    Guia de Produção
                                </CardTitle>
                                <Button size="sm" variant="ghost" className="h-8 text-blue-600 hover:bg-blue-50">
                                    <Download className="w-4 h-4 mr-1" />
                                    PDF
                                </Button>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-0">
                                <div className="divide-y divide-slate-100">
                                    {metrics.productionList.map((item, idx) => (
                                        <div key={item.name} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-700 text-sm">{item.name}</p>
                                                    <p className="text-xs text-slate-400">Total Confirmado</p>
                                                </div>
                                            </div>
                                            <span className="text-lg font-bold text-slate-900">
                                                {item.confirmed} <span className="text-xs font-normal text-slate-400">un</span>
                                            </span>
                                        </div>
                                    ))}
                                    {metrics.productionList.length === 0 && (
                                        <div className="p-8 text-center text-slate-400 text-sm">
                                            Nenhum pedido confirmado para produzir.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400">
                    Sem dados para o período selecionado.
                </div>
            )}
        </div>
    )
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
