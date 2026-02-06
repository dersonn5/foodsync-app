'use client'

import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, UtensilsCrossed, ClipboardList, BarChart3, Settings, LogOut, ChefHat, TrendingUp } from 'lucide-react'

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
        <div className="flex flex-col h-full text-white relative overflow-hidden"
            style={{ background: 'var(--gradient-sidebar)' }}>

            {/* Ambient Background Effect - Warm glow */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/4 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/4 pointer-events-none" />

            {/* Brand Header */}
            <div className="h-24 flex items-center px-6 relative z-10 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                        <ChefHat className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <span className="text-lg font-bold tracking-tight block leading-none text-white">
                            KitchenOS
                        </span>
                        <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest pl-0.5">
                            Gestão de Cozinha
                        </span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto relative z-10 py-6">
                {menuItems.map((item) => {
                    const isActive = item.href === '/admin'
                        ? pathname === '/admin'
                        : pathname.startsWith(item.href)

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={`
                                group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative
                                ${isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                    : 'text-white/60 hover:text-white hover:bg-white/8'
                                }
                            `}
                        >
                            <item.icon className={`
                                w-5 h-5 transition-all duration-200
                                ${isActive ? 'text-white' : 'text-white/50 group-hover:text-white'}
                             `} />
                            <span className={isActive ? 'font-semibold' : ''}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}

                {/* CEO Dashboard Link - Destaque especial */}
                <div className="pt-4 mt-4 border-t border-white/10">
                    <Link
                        href="/ceo"
                        onClick={onClose}
                        className={`
                            group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                            ${pathname === '/ceo'
                                ? 'bg-accent text-white shadow-lg shadow-accent/25'
                                : 'text-white/60 hover:text-white hover:bg-accent/20 border border-accent/30'
                            }
                        `}
                    >
                        <TrendingUp className="w-5 h-5" />
                        <span>Visão CEO</span>
                    </Link>
                </div>
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 mt-auto relative z-10">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                            G
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-semibold text-white truncate">Gerente</p>
                            <p className="text-[10px] text-white/40 truncate">admin@kitchenos.app</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 active:scale-[0.98] transition-all"
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
        <aside className="fixed left-0 top-0 h-full w-72 hidden md:flex flex-col z-50 shadow-xl">
            <SidebarContent />
        </aside>
    )
}
