'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Toaster, toast } from 'sonner'
import { format, subDays, addDays, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
    CheckCircle2,
    XCircle,
    Clock,
    Ban,
    ShoppingBag,
    Utensils,
    Search,
    Filter,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDateDisplay } from '@/lib/utils'

interface Order {
    id: string
    created_at: string
    consumption_date: string
    status: 'pending' | 'confirmed' | 'canceled'
    users: {
        name: string
        email: string
    } | null
    menu_items: {
        name: string
        type: string
    } | null
}

export default function AdminOrdersPageWrapper() {
    return (
        <Suspense fallback={<div className="p-8">Carregando pedidos...</div>}>
            <AdminOrdersPageContent />
        </Suspense>
    )
}

function AdminOrdersPageContent() {
    const supabase = createClient()
    const router = useRouter()
    const searchParams = useSearchParams()

    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed'>('all')
    const [searchQuery, setSearchQuery] = useState('')

    // Identify Date from URL or Default to Today
    const dateParam = searchParams.get('date')
    const currentDateStr = dateParam || format(new Date(), 'yyyy-MM-dd')

    useEffect(() => {
        fetchOrders(currentDateStr)
    }, [currentDateStr])

    async function fetchOrders(date: string) {
        setLoading(true)
        try {
            console.log(`Fetching orders for ${date}...`)

            // Explicit Query with Filter by Consumption Date
            const { data, error } = await supabase
                .from('orders')
                .select(`
                  id,
                  status,
                  consumption_date,
                  created_at,
                  users ( name, phone ),
                  menu_items ( name )
                `)
                .eq('consumption_date', date) // STRICT FILTER
                .order('id', { ascending: false }) // Safe sort

            if (error) {
                console.error("❌ ERRO CRÍTICO PEDIDOS:", JSON.stringify(error, null, 2))
                throw error
            }

            setOrders(data as any || [])
        } catch (error: any) {
            console.error("❌ ERRO CRÍTICO PEDIDOS:", JSON.stringify(error, null, 2))
            toast.error('Erro ao carregar pedidos')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        // Optimistic Update
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus as any } : o))

        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', id)

            if (error) throw error
            toast.success(`Pedido ${newStatus === 'confirmed' ? 'confirmado' : 'cancelado'}`)
        } catch (error) {
            toast.error('Erro ao atualizar')
            fetchOrders(currentDateStr) // Revert
        }
    }

    // Handlers for Navigation
    const handlePrevDay = () => router.push(`/admin/orders?date=${format(subDays(parseISO(currentDateStr), 1), 'yyyy-MM-dd')}`)
    const handleNextDay = () => router.push(`/admin/orders?date=${format(addDays(parseISO(currentDateStr), 1), 'yyyy-MM-dd')}`)
    const handleToday = () => router.push('/admin/orders')

    // Local Filters (Status + Search)
    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === 'all' ? true : order.status === filterStatus
        const matchesSearch = order.users?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.menu_items?.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesStatus && matchesSearch
    })

    const stats = {
        total: orders.length,
        canceled: orders.filter(o => o.status === 'canceled').length,
        pending: orders.filter(o => o.status === 'pending').length
    }

    return (
        // Main Fixed Container with premium gradient
        <div className="h-[calc(100vh-1rem)] flex flex-col pt-4 px-6 pb-6 md:pt-4 md:px-8 md:pb-8 font-sans overflow-hidden bg-transparent">
            <Toaster position="top-right" richColors />

            {/* Header Section - Premium Styling */}
            <div className="flex-none space-y-4 mb-4">
                <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-between">

                    {/* Title Block */}
                    <div className="text-center lg:text-left">
                        <h1 className="text-2xl font-bold tracking-tight flex flex-col items-center gap-2 lg:flex-row lg:gap-3" style={{ color: '#0F2A1D' }}>
                            <div className="p-2 rounded-xl shadow-lg" style={{ backgroundColor: '#0F2A1D' }}>
                                <ShoppingBag className="w-6 h-6 text-white" />
                            </div>
                            Gestão de Pedidos
                        </h1>
                        <p className="text-sm mt-1.5 flex items-center gap-2 justify-center lg:justify-start lg:ml-[52px]" style={{ color: '#517252' }}>
                            Fila para <span className="font-semibold capitalize" style={{ color: '#0F2A1D' }}>{formatDateDisplay(currentDateStr)}</span>
                            {dateParam && (
                                <button onClick={handleToday} className="text-xs text-brand-800 hover:underline font-medium">
                                    (Voltar para hoje)
                                </button>
                            )}
                        </p>
                    </div>

                    {/* Actions Block */}
                    <div className="flex flex-col items-center gap-3 w-full lg:w-auto lg:flex-row lg:items-center">
                        {/* Date Navigation - Glassmorphism */}
                        <div className="bg-white/60 backdrop-blur-xl shadow-sm border border-slate-200/60 rounded-2xl px-3 py-2 flex items-center gap-3 justify-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handlePrevDay}
                                className="h-8 w-8 hover:bg-white/60 text-brand-600 hover:text-brand-900 rounded-xl transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>

                            <div className="flex items-center gap-2 px-3 font-medium text-brand-900 min-w-[120px] justify-center">
                                <CalendarIcon className="w-4 h-4 text-brand-700" />
                                <span className="capitalize text-sm">{formatDateDisplay(currentDateStr)}</span>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleNextDay}
                                className="h-8 w-8 hover:bg-white/60 text-brand-600 hover:text-brand-900 rounded-xl transition-all"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Status Filter - Premium */}
                        <div className="flex items-center gap-1 bg-white/60 backdrop-blur-xl p-1 rounded-xl border border-slate-200/60 shadow-sm">
                            {(['all', 'pending', 'confirmed'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`
                                        px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                        ${filterStatus === status
                                            ? 'bg-brand-800 text-white shadow-md shadow-brand-900/10'
                                            : 'text-brand-600 hover:text-brand-900 hover:bg-white/60'
                                        }
                                    `}
                                >
                                    {status === 'all' ? 'Todos' : status === 'pending' ? 'Pendentes' : 'Confirmados'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* KPI Grid - Premium Design */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border border-slate-200/60 shadow-sm bg-white/60 backdrop-blur-xl hover:shadow-md hover:bg-white/70 transition-all overflow-hidden rounded-2xl">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-medium text-brand-600 uppercase tracking-wider mb-0.5">Total</p>
                                <h3 className="text-2xl font-bold text-brand-900">{stats.total}</h3>
                            </div>
                            <div className="h-10 w-10 bg-gradient-to-br from-brand-800 to-brand-700 rounded-xl flex items-center justify-center shadow-md shadow-brand-900/20">
                                <ShoppingBag className="w-5 h-5 text-white" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-slate-200/60 shadow-sm bg-white/60 backdrop-blur-xl hover:shadow-md hover:bg-white/70 transition-all overflow-hidden rounded-2xl">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-medium text-brand-600 uppercase tracking-wider mb-0.5">Cancelados</p>
                                <h3 className="text-2xl font-bold text-brand-900">{stats.canceled}</h3>
                            </div>
                            <div className="h-10 w-10 bg-red-50 rounded-xl flex items-center justify-center">
                                <Ban className="w-5 h-5 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={`border shadow-sm transition-all overflow-hidden rounded-2xl ${stats.pending > 0
                        ? 'bg-amber-50/60 backdrop-blur-xl border-amber-200/60 shadow-amber-500/10'
                        : 'bg-white/60 backdrop-blur-xl border-slate-200/60 hover:bg-white/70 hover:shadow-md'
                        }`}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className={`text-[10px] font-medium uppercase tracking-wider mb-0.5 ${stats.pending > 0 ? 'text-amber-700' : 'text-brand-600'}`}>
                                    Pendente
                                </p>
                                <h3 className={`text-2xl font-bold ${stats.pending > 0 ? 'text-amber-600' : 'text-brand-900'}`}>
                                    {stats.pending}
                                </h3>
                            </div>
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${stats.pending > 0 ? 'bg-amber-100/80' : 'bg-brand-100/50'}`}>
                                <Clock className={`w-5 h-5 ${stats.pending > 0 ? 'text-amber-600' : 'text-brand-600'}`} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search Bar - Premium */}
                <div className="flex items-center gap-3 bg-white/60 backdrop-blur-xl px-4 py-3 rounded-xl border border-slate-200/60 shadow-sm w-full max-w-sm">
                    <Search className="w-4 h-4 text-brand-600" />
                    <Input
                        placeholder="Filtrar por nome ou prato..."
                        className="border-0 shadow-none focus-visible:ring-0 bg-transparent h-auto py-0 text-sm placeholder:text-brand-400 text-brand-900"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Scrollable Order List */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-3 pb-8">
                {loading ? (
                    <div className="text-center py-12 text-brand-600">Carregando pedidos...</div>
                ) : filteredOrders.length > 0 ? (
                    filteredOrders.map(order => (
                        <div
                            key={order.id}
                            className={`
                                group flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl border transition-all hover:shadow-md
                                ${order.status === 'pending'
                                    ? 'border-amber-200/60 bg-white/80 backdrop-blur-xl shadow-sm shadow-amber-500/5'
                                    : 'bg-white/60 backdrop-blur-xl border-slate-200/60 shadow-sm hover:border-slate-300 hover:bg-white/70'
                                }
                            `}
                        >
                            {/* Left: User Info */}
                            <div className="flex items-center gap-3 min-w-[200px]">
                                <Avatar className="h-11 w-11 border-2 border-slate-100 shadow-sm">
                                    <AvatarFallback className="bg-brand-50 text-brand-800 font-bold text-sm">
                                        {order.users?.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-semibold text-brand-900 text-sm">{order.users?.name}</h4>
                                    <p className="text-[10px] text-brand-600 font-medium">Colaborador</p>
                                </div>
                            </div>

                            {/* Center: Order Info */}
                            <div className="flex-1 flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${order.status === 'confirmed' ? 'bg-brand-50/50' : 'bg-white/60'}`}>
                                    <Utensils className={`w-4 h-4 ${order.status === 'confirmed' ? 'text-brand-800' : 'text-brand-400'}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-brand-900">{order.menu_items?.name}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-brand-600 mt-0.5">
                                        <span>
                                            {format(new Date(order.created_at), "HH:mm '•' dd MMM", { locale: ptBR })}
                                        </span>
                                        {order.status === 'pending' && (
                                            <span className="text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.5 rounded-md">
                                                Aguardando
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-2 justify-end">
                                {order.status === 'pending' && (
                                    <>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleUpdateStatus(order.id, 'canceled')}
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100 hover:border-red-200 h-9 px-4 text-xs rounded-xl"
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                                            className="bg-brand-800 hover:bg-brand-900 text-white h-9 px-5 text-xs rounded-xl shadow-md shadow-brand-900/20 font-semibold"
                                        >
                                            Confirmar
                                        </Button>
                                    </>
                                )}

                                {order.status === 'confirmed' && (
                                    <div className="flex items-center gap-1.5 text-brand-800 font-semibold bg-brand-50/50 px-4 py-2 rounded-xl border border-brand-100/50 text-xs shadow-sm">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Confirmado</span>
                                    </div>
                                )}

                                {order.status === 'canceled' && (
                                    <div className="flex items-center gap-1.5 text-red-500 font-semibold bg-red-50/80 px-4 py-2 rounded-xl border border-red-100/50 text-xs">
                                        <XCircle className="w-4 h-4" />
                                        <span>Cancelado</span>
                                    </div>
                                )}

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-brand-600 hover:bg-white/60 hover:text-brand-900 rounded-xl">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="rounded-xl border border-slate-200/60 bg-white/90 backdrop-blur-xl">
                                        <DropdownMenuItem className="text-brand-900 hover:text-brand-900 focus:bg-white/60">Ver Detalhes</DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-700">Excluir Registro</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-20 bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-sm">
                        <ShoppingBag className="w-12 h-12 mb-3 text-brand-300" />
                        <h3 className="text-base font-semibold text-brand-800">Nenhum pedido para {formatDateDisplay(currentDateStr)}</h3>
                        <p className="text-xs text-brand-600 max-w-xs mx-auto mt-1">Sua cozinha está livre neste dia.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
