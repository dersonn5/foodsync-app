'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, Loader2, ChefHat } from 'lucide-react';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Initialize Supabase Client (Browser/SSR version)
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Authenticate
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // 2. Verify Admin Role
            const { data: adminData, error: adminError } = await supabase
                .from('admins')
                .select('id')
                .eq('id', data.user.id)
                .single();

            if (adminError || !adminData) {
                await supabase.auth.signOut();
                throw new Error('Acesso negado. Este usuário não é um administrador.');
            }

            // 3. Success -> Redirect
            router.push('/admin');
            router.refresh();

        } catch (err: any) {
            console.error("Login error:", err);
            setError(err.message || 'Erro ao autenticar');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full grid lg:grid-cols-2">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex flex-col justify-between bg-slate-900 p-12 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}>
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 text-2xl font-bold">
                        <div className="bg-green-500/20 p-2 rounded-lg">
                            <ChefHat className="w-8 h-8 text-green-400" />
                        </div>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                            FoodSync Admin
                        </span>
                    </div>
                </div>
                <div className="relative z-10 max-w-lg">
                    <blockquote className="text-2xl font-medium leading-relaxed">
                        "Gestão eficiente começa com dados precisos e termina com pratos vazios e clientes felizes."
                    </blockquote>
                    <div className="mt-6 flex items-center gap-4">
                        <div className="h-1 w-12 bg-green-500 rounded-full"></div>
                        <p className="text-slate-400 font-medium">FoodSync System</p>
                    </div>
                </div>
                <div className="relative z-10 text-sm text-slate-500">
                    © 2026 Amplify Marketing Digital. Área Restrita.
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Acesso Administrativo</h2>
                        <p className="text-slate-500">Entre com suas credenciais de gestor.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-red-500" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700 ml-1">Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                                        placeholder="admin@foodsync.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700 ml-1">Senha</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-green-500/20 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                    Verificando permissões...
                                </>
                            ) : (
                                <>
                                    Entrar no Painel
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
