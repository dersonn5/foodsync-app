'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { ArrowRight, LogOut, Ticket, User, Phone, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null)
    const router = useRouter()
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    useEffect(() => {
        const stored = localStorage.getItem('foodsync_user')
        if (stored) {
            setUser(JSON.parse(stored))
        } else {
            router.push('/')
        }
    }, [router])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        localStorage.removeItem('foodsync_user')
        router.push('/')
        router.refresh()
    }

    if (!user) return <div className="min-h-screen bg-slate-50" />

    return (
        <div className="min-h-screen bg-slate-50 pb-32 font-sans">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl px-6 py-6 pt-12 sticky top-0 z-30 border-b border-gray-100/50">
                <div className="flex items-center gap-3">
                    <div className="bg-green-50 p-2 rounded-xl">
                        <User className="w-5 h-5 text-green-600" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Meu Perfil</h1>
                </div>
            </header>

            <main className="p-6 space-y-6 animate-in slide-in-from-bottom-4 duration-700">
                {/* Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2rem] overflow-hidden relative">
                        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-green-50 to-emerald-50/50" />

                        <CardContent className="pt-12 px-6 pb-8 text-center relative">
                            {/* Avatar */}
                            <div className="w-24 h-24 bg-white mx-auto rounded-full p-1 shadow-lg shadow-gray-100 mb-4">
                                <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-inner">
                                    {user.name.charAt(0)}
                                </div>
                            </div>

                            {/* Name & Role */}
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-1">
                                {user.name}
                            </h2>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider mb-6">
                                <ShieldCheck className="w-3 h-3" />
                                {user.role === 'admin' ? 'Administrador' : 'Membro'}
                            </div>

                            {/* Details */}
                            <div className="space-y-4 text-left bg-gray-50/50 rounded-2xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm border border-gray-100">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Telefone</p>
                                        <p className="text-sm font-semibold text-gray-700">{user.phone || 'Não informado'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm border border-gray-100">
                                        <Ticket className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">CPF</p>
                                        <p className="text-sm font-semibold text-gray-700">{user.cpf || 'Não informado'}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Actions */}
                <div className="space-y-3">
                    <motion.div whileTap={{ scale: 0.98 }}>
                        <Button
                            onClick={() => router.push('/orders')}
                            variant="ghost"
                            className="w-full h-14 bg-white hover:bg-gray-50 text-gray-600 font-medium rounded-2xl border border-gray-100 shadow-sm justify-between px-6 group"
                        >
                            <span className="flex items-center gap-3">
                                <Ticket className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                                Meus Pedidos
                            </span>
                            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
                        </Button>
                    </motion.div>

                    <motion.div whileTap={{ scale: 0.98 }}>
                        <Button
                            onClick={handleLogout}
                            variant="ghost"
                            className="w-full h-14 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl border border-red-100 justify-center gap-2 group"
                        >
                            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            Sair do App
                        </Button>
                    </motion.div>
                </div>

                <p className="text-center text-xs text-gray-300 pt-6">
                    FoodSync v1.0 • ID: {user.id.slice(0, 8)}
                </p>
            </main>
        </div>
    )
}
