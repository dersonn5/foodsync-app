'use client'

import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, UtensilsCrossed, ClipboardList, BarChart3, Settings, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: UtensilsCrossed, label: 'Cardápio', href: '/admin/menu' },
    { icon: ClipboardList, label: 'Pedidos', href: '/admin/orders' },
    { icon: BarChart3, label: 'Relatórios', href: '/admin/reports' },
    { icon: Settings, label: 'Configurações', href: '/admin/settings' },
]

export function AdminSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/admin/login')
        router.refresh()
    }

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-slate-100 flex flex-col transition-all duration-300 z-50 shadow-xl">
            {/* Brand */}
            <div className="h-16 flex items-center px-6 border-b border-slate-800">
                <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                    FoodSync Admin
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                                    ? 'bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_15px_-5px_rgb(74,222,128,0.2)]'
                                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                                }
              `}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-green-400' : 'text-slate-500'}`} />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Sair
                </button>
            </div>
        </aside>
    )
}
