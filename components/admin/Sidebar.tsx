'use client'

import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, UtensilsCrossed, ClipboardList, BarChart3, Settings, LogOut, ChefHat } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: UtensilsCrossed, label: 'Cardápio', href: '/admin/menu' },
    { icon: ClipboardList, label: 'Pedidos', href: '/admin/orders' },
    { icon: BarChart3, label: 'Relatórios', href: '/admin/reports' },
    { icon: Settings, label: 'Configurações', href: '/admin/settings' },
]

function SidebarContent({ onClose }: { onClose?: () => void }) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/admin/login')
        router.refresh()
    }

    return (
        <div className="flex flex-col h-full text-white bg-slate-950 border-r border-slate-900/50 shadow-2xl relative overflow-hidden">
            {/* Ambient Background Effect */}
            <div className="absolute top-0 left-0 w-full h-[300px] bg-green-900/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            {/* Brand */}
            <div className="h-24 flex items-center px-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-green-900/20">
                        <ChefHat className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <span className="text-lg font-bold tracking-tight block leading-none">FoodSync</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-0.5">Admin</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto relative z-10 py-4">
                {menuItems.map((item) => {
                    // Exact match for dashboard, startsWith for others to handle subpages
                    const isActive = item.href === '/admin'
                        ? pathname === '/admin'
                        : pathname.startsWith(item.href)

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={`
                                group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-200 relative overflow-hidden
                                ${isActive
                                    ? 'bg-green-600 text-white shadow-lg shadow-green-900/20 font-bold'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }
                            `}
                        >
                            <item.icon className={`
                                w-5 h-5 transition-transform duration-300 group-hover:scale-110 
                                ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}
                             `} />
                            {item.label}

                            {/* Active Shine */}
                            {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 opacity-50" />
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 mt-auto relative z-10">
                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                            ADM
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-bold text-white truncate">Administrador</p>
                            <p className="text-[10px] text-slate-500 truncate">admin@foodsync.com</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 active:scale-95 transition-all"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Sair do Sistema
                    </button>
                </div>
            </div>
        </div>
    )
}

export function AdminSidebar() {
    return (
        <aside className="fixed left-0 top-0 h-full w-72 hidden md:flex flex-col z-50">
            <SidebarContent />
        </aside>
    )
}


