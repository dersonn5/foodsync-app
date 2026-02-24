'use client'

import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, UtensilsCrossed, ClipboardList, BarChart3, Settings, LogOut, TrendingUp, ChevronLeft } from 'lucide-react'
import { useSidebar } from '@/contexts/SidebarContext'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'

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
    const { collapsed } = useSidebar()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/admin/login')
        router.refresh()
    }

    return (
        <div className="flex flex-col h-full text-white relative overflow-hidden"
            style={{ background: 'var(--gradient-sidebar)' }}>

            {/* Ambient Background Effect */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/4 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/4 pointer-events-none" />



            {/* Brand Header */}
            <div className={`h-24 flex items-center relative z-10 border-b border-white/5 ${collapsed ? 'justify-center px-2' : 'px-6'}`}>
                <Logo
                    variant="light"
                    iconOnly={collapsed}
                    className={cn(
                        "transition-all duration-300",
                        collapsed ? "gap-0" : "gap-3"
                    )}
                />
            </div>

            {/* Navigation */}
            <nav className={`flex-1 space-y-1 overflow-y-auto relative z-10 py-6 ${collapsed ? 'px-2' : 'px-4'}`}>
                {menuItems.map((item) => {
                    const isActive = item.href === '/admin'
                        ? pathname === '/admin'
                        : pathname.startsWith(item.href)

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            title={collapsed ? item.label : undefined}
                            className={`
                                group flex items-center rounded-xl text-sm font-medium transition-all duration-200 relative
                                ${collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-4 py-3'}
                                ${isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                    : 'text-white/60 hover:text-white hover:bg-white/8'
                                }
                            `}
                        >
                            <item.icon className={`
                                w-5 h-5 transition-all duration-200 shrink-0
                                ${isActive ? 'text-white' : 'text-white/50 group-hover:text-white'}
                             `} />
                            <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'} ${isActive ? 'font-semibold' : ''}`}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}

                {/* CEO Dashboard Link */}
                <div className={`pt-4 mt-4 border-t border-white/10`}>
                    <Link
                        href="/ceo"
                        onClick={onClose}
                        title={collapsed ? 'Visão CEO' : undefined}
                        className={`
                            group flex items-center rounded-xl text-sm font-medium transition-all duration-200
                            ${collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-4 py-3'}
                            ${pathname === '/ceo'
                                ? 'bg-accent text-white shadow-lg shadow-accent/25'
                                : 'text-white/60 hover:text-white hover:bg-accent/20 border border-accent/30'
                            }
                        `}
                    >
                        <TrendingUp className="w-5 h-5 shrink-0" />
                        <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                            Visão CEO
                        </span>
                    </Link>
                </div>
            </nav>

            {/* Footer / Logout */}
            <div className={`mt-auto relative z-10 ${collapsed ? 'p-2' : 'p-4'}`}>
                {collapsed ? (
                    <button
                        onClick={handleLogout}
                        title="Sair do Sistema"
                        className="w-full flex items-center justify-center py-3 rounded-xl text-red-400 bg-red-500/10 hover:bg-red-500/20 active:scale-[0.98] transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                ) : (
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
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
                )}
            </div>
        </div>
    )
}

export function AdminSidebar() {
    const { collapsed, toggleSidebar } = useSidebar()

    return (
        <aside className={`fixed left-0 top-0 h-full hidden md:flex flex-col z-50 shadow-xl transition-all duration-300 ease-out ${collapsed ? 'w-20' : 'w-72'}`}>
            <SidebarContent />
            {/* Toggle Button - outside overflow-hidden, overlaps sidebar edge */}
            <button
                onClick={toggleSidebar}
                className="absolute top-1/2 -translate-y-1/2 -right-4 z-[60] w-8 h-8 rounded-full bg-brand-500 shadow-lg shadow-brand-500/40 flex items-center justify-center text-white hover:bg-brand-400 hover:shadow-xl hover:shadow-brand-400/50 active:scale-90 transition-all duration-200 ring-4 ring-brand-50"
                title={collapsed ? 'Expandir menu' : 'Recolher menu'}
            >
                <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
            </button>
        </aside>
    )
}
