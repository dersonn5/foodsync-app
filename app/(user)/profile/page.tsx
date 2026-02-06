'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { ArrowRight, LogOut, Ticket, User, Phone, ShieldCheck, Mail, Building2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    useEffect(() => {
        const stored = localStorage.getItem('kitchenos_user')
        if (stored) {
            try {
                setUser(JSON.parse(stored))
            } catch {
                router.push('/')
            }
        } else {
            router.push('/')
        }
        setLoading(false)
    }, [router])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        localStorage.removeItem('kitchenos_user')
        router.push('/')
        router.refresh()
    }

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-50 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-gray-200" />
                    <div className="h-6 w-32 rounded-lg bg-gray-200" />
                </div>
            </div>
        )
    }

    // No user - redirect handled in useEffect
    if (!user) return null

    // Safe getters
    const userName = user?.name || 'Usuário'
    const userInitial = userName.charAt(0).toUpperCase()
    const userPhone = user?.phone || 'Não informado'
    const userCpf = user?.cpf || 'Não informado'
    const userEmail = user?.email || 'Não informado'
    const userUnit = user?.unit_id || 'Matriz'
    const userRole = user?.role || 'user'
    const userId = user?.id?.slice?.(0, 8) || '---'

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-50 pb-32 font-sans">
            {/* Header with gradient */}
            <header className="bg-white/80 backdrop-blur-xl px-6 py-6 pt-12 sticky top-0 z-30 border-b border-gray-100/50">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
                        <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Meu Perfil</h1>
                        <p className="text-xs text-gray-400">Gerencie suas informações</p>
                    </div>
                </div>
            </header>

            <main className="p-6 space-y-6">
                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2rem] overflow-hidden relative">
                        {/* Header gradient */}
                        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50" />

                        <CardContent className="pt-14 px-6 pb-8 text-center relative">
                            {/* Avatar */}
                            <div className="w-28 h-28 bg-white mx-auto rounded-full p-1.5 shadow-xl shadow-emerald-100 mb-4 ring-4 ring-white">
                                <div className="w-full h-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-inner">
                                    {userInitial}
                                </div>
                            </div>

                            {/* Name */}
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
                                {userName}
                            </h2>

                            {/* Role Badge */}
                            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-6 border border-emerald-100">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                {userRole === 'admin' ? 'Administrador' : 'Colaborador'}
                            </div>

                            {/* Info Grid */}
                            <div className="space-y-3 text-left">
                                {/* Phone */}
                                <div className="flex items-center gap-4 bg-gray-50/80 rounded-2xl p-4 border border-gray-100/50">
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm border border-gray-100">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Telefone</p>
                                        <p className="text-sm font-semibold text-gray-800">{userPhone}</p>
                                    </div>
                                </div>

                                {/* CPF */}
                                <div className="flex items-center gap-4 bg-gray-50/80 rounded-2xl p-4 border border-gray-100/50">
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-amber-500 shadow-sm border border-gray-100">
                                        <Ticket className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CPF</p>
                                        <p className="text-sm font-semibold text-gray-800">{userCpf}</p>
                                    </div>
                                </div>

                                {/* Unit */}
                                <div className="flex items-center gap-4 bg-gray-50/80 rounded-2xl p-4 border border-gray-100/50">
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-violet-500 shadow-sm border border-gray-100">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Unidade</p>
                                        <p className="text-sm font-semibold text-gray-800">{userUnit}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Actions */}
                <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <motion.div whileTap={{ scale: 0.98 }}>
                        <Button
                            onClick={() => router.push('/orders')}
                            variant="ghost"
                            className="w-full h-16 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-2xl border border-gray-100 shadow-sm justify-between px-6 group"
                        >
                            <span className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                    <Ticket className="w-5 h-5 text-emerald-600" />
                                </div>
                                <span>Meus Pedidos</span>
                            </span>
                            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                        </Button>
                    </motion.div>

                    <motion.div whileTap={{ scale: 0.98 }}>
                        <Button
                            onClick={handleLogout}
                            variant="ghost"
                            className="w-full h-16 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl border border-red-100 justify-center gap-3 group"
                        >
                            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            Sair do Aplicativo
                        </Button>
                    </motion.div>
                </motion.div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-300 pt-6">
                    KitchenOS v1.0 • ID: {userId}
                </p>
            </main>
        </div>
    )
}

