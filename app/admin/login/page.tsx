'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Lock, Mail, ArrowRight, Loader2, ChefHat, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Toaster, toast } from 'sonner'
import { Logo } from '@/components/ui/logo'

export default function AdminLogin() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // 1. Authenticate
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            // 2. Verify Admin Role
            const { data: adminData, error: adminError } = await supabase
                .from('admins')
                .select('id')
                .eq('id', data.user.id)
                .single()

            if (adminError || !adminData) {
                await supabase.auth.signOut()
                throw new Error('Acesso negado. Apenas administradores.')
            }

            // 3. Success
            toast.success('Login realizado com sucesso!')
            router.push('/admin')
            router.refresh()

        } catch (err: any) {
            console.error("Login error:", err)
            toast.error(err.message || 'Erro ao autenticar')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-brand-50 relative overflow-hidden font-sans selection:bg-brand-500/30 selection:text-brand-100">
            <Toaster position="top-right" theme="dark" richColors />

            {/* Ambient Background Effects (Video) */}
            <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover scale-105"
                    src="https://cdn.coverr.co/videos/coverr-preparing-a-pizza-5164/1080p.mp4"
                />
                <div className="absolute inset-0 bg-brand-500/60 mix-blend-multiply" />
                <div className="absolute inset-0 bg-black/40" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md relative z-10 p-6"
            >
                {/* Glass Card */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl overflow-hidden p-8 md:p-10 relative">
                    {/* Subtle inner light reflection */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

                    {/* Header */}
                    <div className="text-center space-y-4 mb-8 relative z-10">
                        <motion.div
                            className="inline-flex items-center justify-center mx-auto mb-2"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Logo variant="light" className="scale-125 md:scale-150 drop-shadow-md" />
                        </motion.div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-white mb-1 drop-shadow-md">
                                Painel <span className="text-brand-200">Admin</span>
                            </h2>
                            <p className="text-brand-50/80 text-sm drop-shadow-sm font-medium">
                                Centro de Controle Operacional
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-5 relative z-10">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-brand-50/80 uppercase tracking-wider ml-1">
                                Email Corporativo
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-brand-100 group-focus-within:text-white transition-colors" />
                                </div>
                                <Input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-11 bg-black/20 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-brand-200/50 focus-visible:border-white/50 h-12 rounded-xl transition-all shadow-inner font-medium"
                                    placeholder="admin@kitchenos.app"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-brand-50/80 uppercase tracking-wider ml-1">
                                Senha de Acesso
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-brand-100 group-focus-within:text-white transition-colors" />
                                </div>
                                <Input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-11 bg-black/20 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-brand-200/50 focus-visible:border-white/50 h-12 rounded-xl transition-all shadow-inner font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-400 hover:to-brand-300 border border-brand-300/30 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:shadow-brand-500/20 transition-all transform active:scale-[0.98] mt-4"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                            ) : (
                                <span className="flex items-center">
                                    Acessar Painel <ArrowRight className="ml-2 h-4 w-4" />
                                </span>
                            )}
                        </Button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-sm">
                            <ShieldCheck className="w-3 h-3 text-brand-200" />
                            <span className="text-[10px] font-medium text-brand-50/80">Ambiente Seguro & Criptografado</span>
                        </div>
                    </div>
                </div>

                <p className="text-center text-white/50 text-xs mt-6 drop-shadow-sm font-medium">
                    © 2026 KitchenOS System.
                </p>
            </motion.div>
        </div>
    )
}
