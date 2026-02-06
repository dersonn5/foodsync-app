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
        <div className="h-[calc(100vh-1rem)] flex flex-col p-4 md:p-6 max-w-[1600px] mx-auto font-sans overflow-hidden bg-gradient-to-br from-stone-50 via-white to-stone-100">
            <Toaster position="top-right" richColors />

            {/* Header Section - Premium Styling */}
            <div className="flex-none space-y-4 mb-4">
                <div className="flex flex-col gap-4 mb-2 md:flex-row md:items-center md:justify-between">

                    {/* Title Block */}
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-stone-800 tracking-tight flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
                                <ShoppingBag className="w-6 h-6 text-white" />
                            </div>
                            Gestão de Pedidos
                        </h1>
                        <p className="text-stone-500 text-sm flex items-center gap-2 ml-[52px]">
                            Fila para <span className="font-semibold text-stone-700 capitalize">{formatDateDisplay(currentDateStr)}</span>
                            {dateParam && (
                                <button onClick={handleToday} className="text-xs text-emerald-600 hover:underline font-medium">
                                    (Voltar para hoje)
                                </button>
                            )}
                        </p>
                    </div>

                    {/* Actions Block */}
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                        {/* Date Navigation - Glassmorphism */}
                        <div className="bg-white/70 backdrop-blur-xl shadow-lg shadow-black/5 border border-white/50 rounded-2xl px-3 py-2 flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handlePrevDay}
                                className="h-8 w-8 hover:bg-stone-100 text-stone-600 hover:text-stone-900 rounded-xl transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>

                            <div className="flex items-center gap-2 px-3 font-medium text-stone-700 min-w-[120px] justify-center">
                                <CalendarIcon className="w-4 h-4 text-emerald-500" />
                                <span className="capitalize text-sm">{formatDateDisplay(currentDateStr)}</span>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleNextDay}
                                className="h-8 w-8 hover:bg-stone-100 text-stone-600 hover:text-stone-900 rounded-xl transition-all"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Status Filter - Premium */}
                        <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm p-1 rounded-xl border border-stone-200/60 shadow-sm">
                            {(['all', 'pending', 'confirmed'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`
                                        px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                        ${filterStatus === status
                                            ? 'bg-stone-800 text-white shadow-md'
                                            : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
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
                    <Card className="border border-stone-200/60 shadow-sm bg-white hover:shadow-md transition-all overflow-hidden rounded-2xl">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-medium text-stone-500 uppercase tracking-wider mb-0.5">Total</p>
                                <h3 className="text-2xl font-bold text-stone-800">{stats.total}</h3>
                            </div>
                            <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/20">
                                <ShoppingBag className="w-5 h-5 text-white" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-stone-200/60 shadow-sm bg-white hover:shadow-md transition-all overflow-hidden rounded-2xl">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-medium text-stone-500 uppercase tracking-wider mb-0.5">Cancelados</p>
                                <h3 className="text-2xl font-bold text-stone-800">{stats.canceled}</h3>
                            </div>
                            <div className="h-10 w-10 bg-red-50 rounded-xl flex items-center justify-center">
                                <Ban className="w-5 h-5 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={`border shadow-sm transition-all overflow-hidden rounded-2xl ${stats.pending > 0
                            ? 'bg-amber-50/50 border-amber-200'
                            : 'bg-white border-stone-200/60'
                        }`}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className={`text-[10px] font-medium uppercase tracking-wider mb-0.5 ${stats.pending > 0 ? 'text-amber-600' : 'text-stone-500'}`}>
                                    Pendente
                                </p>
                                <h3 className={`text-2xl font-bold ${stats.pending > 0 ? 'text-amber-600' : 'text-stone-800'}`}>
                                    {stats.pending}
                                </h3>
                            </div>
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${stats.pending > 0 ? 'bg-amber-100' : 'bg-stone-100'}`}>
                                <Clock className={`w-5 h-5 ${stats.pending > 0 ? 'text-amber-600' : 'text-stone-400'}`} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search Bar - Premium */}
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-stone-200/60 shadow-sm w-full max-w-sm">
                    <Search className="w-4 h-4 text-stone-400" />
                    <Input
                        placeholder="Filtrar por nome ou prato..."
                        className="border-0 shadow-none focus-visible:ring-0 bg-transparent h-auto py-0 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Scrollable Order List */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-3">
                {loading ? (
                    <div className="text-center py-12 text-stone-400">Carregando pedidos...</div>
                ) : filteredOrders.length > 0 ? (
                    filteredOrders.map(order => (
                        <div
                            key={order.id}
                            className={`
                                group flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-white border transition-all hover:shadow-lg
                                ${order.status === 'pending'
                                    ? 'border-amber-200 shadow-md shadow-amber-500/5'
                                    : 'border-stone-200/60 shadow-sm hover:border-stone-200'
                                }
                            `}
                        >
                            {/* Left: User Info */}
                            <div className="flex items-center gap-3 min-w-[200px]">
                                <Avatar className="h-11 w-11 border-2 border-emerald-100 shadow-sm">
                                    <AvatarFallback className="bg-emerald-50 text-emerald-600 font-bold text-sm">
                                        {order.users?.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-semibold text-stone-800 text-sm">{order.users?.name}</h4>
                                    <p className="text-[10px] text-stone-400 font-medium">Colaborador</p>
                                </div>
                            </div>

                            {/* Center: Order Info */}
                            <div className="flex-1 flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${order.status === 'confirmed' ? 'bg-emerald-50' : 'bg-stone-50'}`}>
                                    <Utensils className={`w-4 h-4 ${order.status === 'confirmed' ? 'text-emerald-600' : 'text-stone-500'}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-stone-800">{order.menu_items?.name}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-0.5">
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
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white h-9 px-5 text-xs rounded-xl shadow-md shadow-emerald-500/20 font-semibold"
                                        >
                                            Confirmar
                                        </Button>
                                    </>
                                )}

                                {order.status === 'confirmed' && (
                                    <div className="flex items-center gap-1.5 text-emerald-600 font-semibold bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 text-xs">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Confirmado</span>
                                    </div>
                                )}

                                {order.status === 'canceled' && (
                                    <div className="flex items-center gap-1.5 text-red-500 font-semibold bg-red-50 px-4 py-2 rounded-xl border border-red-100 text-xs">
                                        <XCircle className="w-4 h-4" />
                                        <span>Cancelado</span>
                                    </div>
                                )}

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-stone-400 hover:bg-stone-100 rounded-xl">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="rounded-xl">
                                        <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-500">Excluir Registro</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-20 bg-white/50 rounded-2xl border-2 border-dashed border-stone-200">
                        <ShoppingBag className="w-12 h-12 mb-3 text-stone-300" />
                        <h3 className="text-base font-semibold text-stone-500">Nenhum pedido para {formatDateDisplay(currentDateStr)}</h3>
                        <p className="text-xs text-stone-400 max-w-xs mx-auto mt-1">Sua cozinha está livre neste dia.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
