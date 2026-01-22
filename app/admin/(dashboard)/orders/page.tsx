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
                  users ( name, avatar_url, phone ),
                  menu_items ( name, image_url )
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
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 font-sans">
            <Toaster position="top-right" richColors />

            {/* Header & Date Navigation */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            Painel de Operações

                            {/* Date Controls */}
                            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-base ml-2">
                                <Button variant="ghost" size="icon" onClick={handlePrevDay} className="h-7 w-7 hover:bg-white hover:text-slate-900 rounded-lg text-slate-500">
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>

                                <div className="flex items-center gap-2 px-2 font-medium text-slate-700 min-w-[120px] justify-center cursor-pointer hover:bg-white/50 py-1 rounded-md transition-all">
                                    <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="capitalize text-sm">{formatDateDisplay(currentDateStr)}</span>
                                </div>

                                <Button variant="ghost" size="icon" onClick={handleNextDay} className="h-7 w-7 hover:bg-white hover:text-slate-900 rounded-lg text-slate-500">
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </h1>
                        <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                            Gerencie o fluxo de pedidos para <span className="font-semibold text-slate-700 capitalize">{formatDateDisplay(currentDateStr)}</span>
                            {dateParam && (
                                <button onClick={handleToday} className="text-xs text-green-600 hover:underline font-medium">
                                    (Voltar para Hoje)
                                </button>
                            )}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                        {(['all', 'pending', 'confirmed'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`
                                    px-4 py-1.5 rounded-lg text-sm font-medium transition-all
                                    ${filterStatus === status
                                        ? 'bg-slate-900 text-white shadow-md'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                    }
                                `}
                            >
                                {status === 'all' ? 'Todos' : status === 'pending' ? 'Pendentes' : 'Confirmados'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-0 shadow-[0_2px_10px_rgba(0,0,0,0.03)] bg-gradient-to-br from-blue-50 to-white">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Total Pedidos</p>
                                <h3 className="text-3xl font-bold text-slate-900">{stats.total}</h3>
                            </div>
                            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                <ShoppingBag className="w-6 h-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-[0_2px_10px_rgba(0,0,0,0.03)] bg-gradient-to-br from-rose-50 to-white">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-1">Cancelamentos</p>
                                <h3 className="text-3xl font-bold text-slate-900">{stats.canceled}</h3>
                            </div>
                            <div className="h-12 w-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
                                <Ban className="w-6 h-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={`border-0 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-colors ${stats.pending > 0 ? 'bg-amber-50' : 'bg-white'}`}>
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${stats.pending > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                                    Fila Pendente
                                </p>
                                <h3 className={`text-3xl font-bold ${stats.pending > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
                                    {stats.pending}
                                </h3>
                            </div>
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${stats.pending > 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                                <Clock className="w-6 h-6" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Orders Feed */}
            <div className="space-y-4">
                <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-100 shadow-sm max-w-md">
                    <Search className="w-5 h-5 text-slate-400 ml-2" />
                    <Input
                        placeholder="Buscar por nome do cliente ou prato..."
                        className="border-0 shadow-none focus-visible:ring-0 bg-transparent h-auto py-1"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {loading ? (
                        <div className="text-center py-12 text-slate-400">Carregando pedidos...</div>
                    ) : filteredOrders.length > 0 ? (
                        filteredOrders.map(order => (
                            <div
                                key={order.id}
                                className={`
                                    group flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border transition-all hover:shadow-md
                                    ${order.status === 'pending' ? 'border-amber-200 shadow-[0_0_0_1px_rgba(251,191,36,0.2)]' : 'border-slate-100 shadow-sm'}
                                `}
                            >
                                {/* Left: User Info */}
                                <div className="flex items-center gap-4 min-w-[240px]">
                                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                        <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                                            {order.users?.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{order.users?.name}</h4>
                                        <p className="text-xs text-slate-500 font-medium">Membro</p>
                                    </div>
                                </div>

                                {/* Center: Order Info */}
                                <div className="flex-1 flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${order.status === 'confirmed' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-500'}`}>
                                        <Utensils className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{order.menu_items?.name}</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                            <span>
                                                {format(new Date(order.created_at), "HH:mm '•' dd MMM", { locale: ptBR })}
                                            </span>
                                            {order.status === 'pending' && (
                                                <span className="text-amber-600 font-bold bg-amber-50 px-1.5 rounded-sm">
                                                    Aguardando Confirmação
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
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100 hover:border-red-200 h-10 px-4 rounded-xl"
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                                                className="bg-green-600 hover:bg-green-700 text-white h-10 px-6 rounded-xl shadow-lg shadow-green-200 font-bold"
                                            >
                                                Confirmar
                                            </Button>
                                        </>
                                    )}

                                    {order.status === 'confirmed' && (
                                        <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-xl border border-green-100">
                                            <CheckCircle2 className="w-5 h-5" />
                                            <span>Confirmado</span>
                                        </div>
                                    )}

                                    {order.status === 'canceled' && (
                                        <div className="flex items-center gap-2 text-red-400 font-bold bg-red-50 px-4 py-2 rounded-xl border border-red-100">
                                            <XCircle className="w-5 h-5" />
                                            <span>Cancelado</span>
                                        </div>
                                    )}

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:bg-slate-50 rounded-xl">
                                                <MoreHorizontal className="w-5 h-5" />
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
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-slate-200" />
                            <h3 className="text-lg font-bold text-slate-400">Nenhum pedido para {formatDateDisplay(currentDateStr)}</h3>
                            <p className="text-slate-300 max-w-xs mx-auto mt-1">Use as setas acima para navegar para outros dias.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
