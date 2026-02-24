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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-slate-200" />
                    <div className="h-6 w-32 rounded-lg bg-slate-200" />
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 pb-32 font-sans">
            {/* Header with gradient */}
            <header className="bg-white/80 backdrop-blur-xl px-6 py-6 pt-12 sticky top-0 z-30 border-b border-slate-200/60">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl shadow-lg shadow-brand-900/10" style={{ backgroundColor: '#0F2A1D' }}>
                        <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight" style={{ color: '#0F2A1D' }}>Meu Perfil</h1>
                        <p className="text-xs text-slate-500">Gerencie suas informações</p>
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
                    <Card className="border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/60 backdrop-blur-xl rounded-[2rem] overflow-hidden relative">
                        {/* Header gradient */}
                        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-br from-slate-50 via-white to-slate-50" />

                        <CardContent className="pt-14 px-6 pb-8 text-center relative">
                            {/* Avatar */}
                            <div className="w-28 h-28 bg-white mx-auto rounded-full p-1.5 shadow-xl shadow-slate-200/60 mb-4 ring-4 ring-white">
                                <div className="w-full h-full rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-inner" style={{ backgroundColor: '#0F2A1D' }}>
                                    {userInitial}
                                </div>
                            </div>

                            {/* Name */}
                            <h2 className="text-2xl font-bold tracking-tight mb-2" style={{ color: '#0F2A1D' }}>
                                {userName}
                            </h2>

                            {/* Role Badge */}
                            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-brand-50 text-brand-800 text-xs font-bold uppercase tracking-wider mb-6 border border-brand-200">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                {userRole === 'admin' ? 'Administrador' : 'Colaborador'}
                            </div>

                            {/* Info Grid */}
                            <div className="space-y-3 text-left">
                                {/* Phone */}
                                <div className="flex items-center gap-4 bg-slate-50/80 rounded-2xl p-4 border border-slate-200/60">
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-200/60" style={{ color: '#0F2A1D' }}>
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Telefone</p>
                                        <p className="text-sm font-semibold" style={{ color: '#0F2A1D' }}>{userPhone}</p>
                                    </div>
                                </div>

                                {/* CPF */}
                                <div className="flex items-center gap-4 bg-slate-50/80 rounded-2xl p-4 border border-slate-200/60">
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-200/60" style={{ color: '#0F2A1D' }}>
                                        <Ticket className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CPF</p>
                                        <p className="text-sm font-semibold" style={{ color: '#0F2A1D' }}>{userCpf}</p>
                                    </div>
                                </div>

                                {/* Unit */}
                                <div className="flex items-center gap-4 bg-slate-50/80 rounded-2xl p-4 border border-slate-200/60">
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-200/60" style={{ color: '#0F2A1D' }}>
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unidade</p>
                                        <p className="text-sm font-semibold" style={{ color: '#0F2A1D' }}>{userUnit}</p>
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
                            className="w-full h-16 bg-white/60 backdrop-blur-xl hover:bg-white text-slate-700 font-semibold rounded-2xl border border-slate-200/60 shadow-sm justify-between px-6 group"
                        >
                            <span className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                                    <Ticket className="w-5 h-5 text-brand-800" />
                                </div>
                                <span style={{ color: '#0F2A1D' }}>Meus Pedidos</span>
                            </span>
                            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-brand-800 group-hover:translate-x-1 transition-all" />
                        </Button>
                    </motion.div>

                    <motion.div whileTap={{ scale: 0.98 }}>
                        <Button
                            onClick={handleLogout}
                            variant="ghost"
                            className="w-full h-16 bg-red-50/80 backdrop-blur-xl hover:bg-red-50 text-red-600 font-bold rounded-2xl border border-red-100 justify-center gap-3 group"
                        >
                            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            Sair do Aplicativo
                        </Button>
                    </motion.div>
                </motion.div>

                {/* Footer */}
                <p className="text-center text-xs text-slate-400 pt-6">
                    FoodSync v1.0 • ID: {userId}
                </p>
            </main>
        </div>
    )
}

