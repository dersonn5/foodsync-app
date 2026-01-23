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
        // Main Fixed Container (No Window Scroll)
        <div className="h-[calc(100vh-1rem)] flex flex-col p-4 max-w-[1600px] mx-auto font-sans overflow-hidden">
            <Toaster position="top-right" richColors />

            {/* Fixed Header Section (Flex None) */}
            <div className="flex-none space-y-4 mb-4">
                <div className="flex flex-col gap-4 mb-2 md:flex-row md:items-center md:justify-between">

                    {/* Bloco de Título e Subtítulo */}
                    <div className="space-y-1">
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            Gestão de Pedidos
                        </h1>
                        <p className="text-slate-500 text-xs flex items-center gap-2">
                            Fila para <span className="font-semibold text-slate-700 capitalize">{formatDateDisplay(currentDateStr)}</span>
                            {dateParam && (
                                <button onClick={handleToday} className="text-xs text-green-600 hover:underline font-medium">
                                    (Voltar)
                                </button>
                            )}
                        </p>
                    </div>

                    {/* Bloco de Ações (DateNav + Filters) */}
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                        {/* Date Controls */}
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-sm self-start md:self-auto">
                            <Button variant="ghost" size="icon" onClick={handlePrevDay} className="h-6 w-6 hover:bg-white hover:text-slate-900 rounded-md text-slate-500">
                                <ChevronLeft className="w-4 h-4" />
                            </Button>

                            <div className="flex items-center gap-2 px-2 font-medium text-slate-700 min-w-[110px] justify-center cursor-pointer hover:bg-white/50 py-0.5 rounded transition-all">
                                <CalendarIcon className="w-3 h-3 text-slate-400" />
                                <span className="capitalize">{formatDateDisplay(currentDateStr)}</span>
                            </div>

                            <Button variant="ghost" size="icon" onClick={handleNextDay} className="h-6 w-6 hover:bg-white hover:text-slate-900 rounded-md text-slate-500">
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm self-start md:self-auto">
                            {(['all', 'pending', 'confirmed'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`
                                        px-3 py-1 rounded-md text-xs font-medium transition-all
                                        ${filterStatus === status
                                            ? 'bg-slate-900 text-white shadow-sm'
                                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                        }
                                    `}
                                >
                                    {status === 'all' ? 'Todos' : status === 'pending' ? 'Pendentes' : 'Confirmados'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Compact KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-0.5">Total</p>
                                <h3 className="text-2xl font-bold text-slate-900">{stats.total}</h3>
                            </div>
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm bg-gradient-to-br from-rose-50 to-white">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-0.5">Cancelados</p>
                                <h3 className="text-2xl font-bold text-slate-900">{stats.canceled}</h3>
                            </div>
                            <div className="h-10 w-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
                                <Ban className="w-5 h-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={`border-0 shadow-sm transition-colors ${stats.pending > 0 ? 'bg-amber-50' : 'bg-white'}`}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${stats.pending > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                                    Pendente
                                </p>
                                <h3 className={`text-2xl font-bold ${stats.pending > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
                                    {stats.pending}
                                </h3>
                            </div>
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${stats.pending > 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                                <Clock className="w-5 h-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search Bar (Compact) */}
                <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg border border-slate-100 shadow-sm w-full max-w-sm">
                    <Search className="w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Filtrar por nome ou prato..."
                        className="border-0 shadow-none focus-visible:ring-0 bg-transparent h-auto py-0 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Scrollable Order List Area (Flex 1) */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-3">
                {loading ? (
                    <div className="text-center py-12 text-slate-400">Carregando pedidos...</div>
                ) : filteredOrders.length > 0 ? (
                    filteredOrders.map(order => (
                        <div
                            key={order.id}
                            className={`
                                    group flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-white border transition-all hover:shadow-md
                                    ${order.status === 'pending' ? 'border-amber-200 shadow-[0_0_0_1px_rgba(251,191,36,0.2)]' : 'border-slate-100 shadow-sm'}
                                `}
                        >
                            {/* Left: User Info */}
                            <div className="flex items-center gap-3 min-w-[200px]">
                                <Avatar className="h-10 w-10 border border-white shadow-sm">
                                    <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-sm">
                                        {order.users?.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">{order.users?.name}</h4>
                                    <p className="text-[10px] text-slate-500 font-medium">Membro</p>
                                </div>
                            </div>

                            {/* Center: Order Info */}
                            <div className="flex-1 flex items-center gap-3">
                                <div className={`p-1.5 rounded-lg ${order.status === 'confirmed' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-500'}`}>
                                    <Utensils className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">{order.menu_items?.name}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                        <span>
                                            {format(new Date(order.created_at), "HH:mm '•' dd MMM", { locale: ptBR })}
                                        </span>
                                        {order.status === 'pending' && (
                                            <span className="text-amber-600 font-bold bg-amber-50 px-1 rounded-[4px]">
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
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100 hover:border-red-200 h-8 px-3 text-xs rounded-lg"
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                                            className="bg-green-600 hover:bg-green-700 text-white h-8 px-4 text-xs rounded-lg shadow-sm font-bold"
                                        >
                                            Confirmar
                                        </Button>
                                    </>
                                )}

                                {order.status === 'confirmed' && (
                                    <div className="flex items-center gap-1.5 text-green-600 font-bold bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 text-xs">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Confirmado</span>
                                    </div>
                                )}

                                {order.status === 'canceled' && (
                                    <div className="flex items-center gap-1.5 text-red-400 font-bold bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 text-xs">
                                        <XCircle className="w-4 h-4" />
                                        <span>Cancelado</span>
                                    </div>
                                )}

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:bg-slate-50 rounded-lg">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-500">Excluir Registro</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-20 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                        <ShoppingBag className="w-12 h-12 mb-3 text-slate-200" />
                        <h3 className="text-base font-bold text-slate-400">Nenhum pedido para {formatDateDisplay(currentDateStr)}</h3>
                        <p className="text-xs text-slate-300 max-w-xs mx-auto mt-1">Sua cozinha está livre neste dia.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
