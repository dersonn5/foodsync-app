'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Utensils, Leaf, Coffee, Send, LogOut, AlertCircle, CheckCircle, TrendingUp, DollarSign, Users } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

// Helper for tomorrow's date YYYY-MM-DD
const tomorrow = addDays(new Date(), 1)
const tomorrowStr = tomorrow.toISOString().split('T')[0]

// Mock Data for Charts (since we don't have historical data yet)
const weeklyData = [
    { name: 'Seg', orders: 120 },
    { name: 'Ter', orders: 132 },
    { name: 'Qua', orders: 101 },
    { name: 'Qui', orders: 154 },
    { name: 'Sex', orders: 98 },
]

const COLORS = ['#22c55e', '#f59e0b', '#ef4444'] // Green, Amber, Red

export default function AdminPage() {
    const [user, setUser] = useState<any>(null)
    const [stats, setStats] = useState({ main: 0, fit: 0, snack: 0, total: 0, users_count: 0 })
    const [loadingStats, setLoadingStats] = useState(true)
    const [triggering, setTriggering] = useState(false)
    const [recentOrders, setRecentOrders] = useState<any[]>([])
    const router = useRouter()

    // 1. Auth check
    // 1. Auth check (Replaced legacy localStorage with Supabase Auth)
    const supabase = createClient()

    useEffect(() => {
        async function getUser() {
            try {
                const { data: { user }, error } = await supabase.auth.getUser()
                if (error || !user) {
                    console.error('Auth error or no user:', error)
                    router.push('/admin/login')
                    return
                }
                // Fetch additional details if needed
                setUser({ ...user, name: user.user_metadata?.name || 'Administrador' })
            } catch (err) {
                router.push('/admin/login')
            }
        }
        getUser()
    }, [router, supabase.auth])

    // 2. Fetch Data
    useEffect(() => {
        async function fetchData() {
            if (!user) return

            try {
                // A. Stats for Tomorrow
                const { data: orders, error: orderError } = await supabase
                    .from('orders')
                    .select(`id, status, menu_items(name, type), users(name)`)
                    .eq('consumption_date', tomorrowStr)

                if (orderError) throw orderError

                // B. Total Users (for Adoption Rate)
                const { count: usersCount, error: userError } = await supabase
                    .from('users')
                    .select('*', { count: 'exact', head: true })
                    .eq('role', 'employee') // Assuming adoption rate is based on employees

                if (userError) throw userError

                // Process Stats
                const newStats = { main: 0, fit: 0, snack: 0, total: orders?.length || 0, users_count: usersCount || 1 }
                orders?.forEach((order: any) => {
                    const type = order.menu_items?.type
                    if (type === 'main') newStats.main++
                    if (type === 'fit') newStats.fit++
                    if (type === 'snack') newStats.snack++
                })
                setStats(newStats)

                // C. Process Recent Orders (Mocking "Recent" as just top 5 from tomorrow's list for now)
                // In real app, remove .eq('consumption_date') to get actual recent globally
                const { data: recent, error: recentError } = await supabase
                    .from('orders')
                    .select(`
              id, 
              created_at, 
              status, 
              users (name), 
              menu_items (name)
           `)
                    .order('created_at', { ascending: false })
                    .limit(5)

                if (recentError) throw recentError
                setRecentOrders(recent || [])

            } catch (err) {
                console.error('Error fetching admin data', err)
            } finally {
                setLoadingStats(false)
            }
        }

        if (user) fetchData()
    }, [user])

    const handleCreateN8NTrigger = async () => {
        if (!confirm('Deseja realmente disparar as confirmações via WhatsApp?')) return
        setTriggering(true)
        try {
            const res = await fetch('/api/disparo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: tomorrowStr, action: 'trigger_confirmations', triggered_by: user.id })
            })
            if (!res.ok) throw new Error('Falha no servidor')
            alert('🚀 Disparo iniciado com sucesso!')
        } catch (err: any) {
            alert('Erro: ' + err.message)
        } finally {
            setTriggering(false)
        }
    }

    // Calculations
    const adoptionRate = Math.round((stats.total / (stats.users_count || 1)) * 100)
    const avoidedWaste = 0 * 25 // Mocking cancellations as 0 for now
    const pieData = [
        { name: 'Confirmados', value: stats.total }, // Assuming all for tomorrow are 'pending' but effectively confirmed orders
        { name: 'Pendentes', value: Math.max(0, stats.users_count - stats.total) }, // Those who haven't ordered
        { name: 'Cancelados', value: 0 },
    ]

    if (!user) return <div className="h-screen flex items-center justify-center text-slate-500">Verificando...</div>

    return (
        <div className="flex-1 p-8 space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Painel de Controle</h1>
                    <p className="text-slate-500">Visão geral para <span className="font-semibold text-slate-700">{format(tomorrow, "dd 'de' MMMM", { locale: ptBR })}</span></p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-400">Administrador</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold border border-green-200">
                        {user.name.charAt(0)}
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex justify-end border-b border-slate-200 pb-6">
                <Button onClick={handleCreateN8NTrigger} disabled={triggering} className="bg-green-600 hover:bg-green-700 shadow-md">
                    <Send className="w-4 h-4 mr-2" />
                    {triggering ? 'Enviando...' : 'Disparar WhatsApp'}
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard title="Pratos Confirmados" value={stats.total} icon={Utensils} color="blue" sub="+12% vs ontem" />
                <KpiCard title="Cancelamentos" value="0" icon={AlertCircle} color="red" sub="-5% vs semana" />
                <KpiCard title="Taxa de Adesão" value={`${adoptionRate}%`} icon={TrendingUp} color="green" sub="Meta: 85%" />
                <KpiCard title="Desperdício Evitado" value={`R$ ${avoidedWaste},00`} icon={DollarSign} color="emerald" sub="Estimativa Mensal" />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bar Chart */}
                <Card className="lg:col-span-2 border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-800">Pratos Mais Pedidos (Semana)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#f1f5f9' }}
                                />
                                <Bar dataKey="orders" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Pie Chart */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-800">Status dos Pedidos</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders Table */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                    <CardTitle className="text-lg font-semibold text-slate-800">Últimas Movimentações</CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3">Funcionário</th>
                                <th className="px-6 py-3">Prato</th>
                                <th className="px-6 py-3">Horário</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.length > 0 ? recentOrders.map((order) => (
                                <tr key={order.id} className="bg-white border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{order.users?.name || 'Unknown'}</td>
                                    <td className="px-6 py-4 text-slate-600">{order.menu_items?.name || 'Prato'}</td>
                                    <td className="px-6 py-4 text-slate-500 font-mono">
                                        {format(new Date(order.created_at), "HH:mm")}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                    ${order.status === 'pending' ? 'bg-amber-100 text-amber-800' : ''}
                                    ${order.status === 'consumed' ? 'bg-green-100 text-green-800' : ''}
                                    ${order.status === 'missed' ? 'bg-red-100 text-red-800' : ''}
                                `}>
                                            {order.status === 'pending' ? 'Pendente' : order.status}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-slate-400">Nenhum pedido recente.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}

// KPI Card Component
function KpiCard({ title, value, icon: Icon, color, sub }: any) {
    const colorClasses: any = {
        green: 'bg-green-50 text-green-600',
        blue: 'bg-blue-50 text-blue-600',
        red: 'bg-red-50 text-red-600',
        emerald: 'bg-emerald-50 text-emerald-600'
    }

    return (
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-center justify-between space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100">
                        <Icon className={`w-6 h-6 ${color === 'red' ? 'text-red-500' : 'text-slate-600'}`} />
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-slate-500">{title}</p>
                        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
                    </div>
                </div>
                <div className="mt-4 flex items-center text-xs">
                    <span className="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                        {sub}
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}
