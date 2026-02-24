'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Utensils, Ticket, User, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function UserLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    const navItems = [
        {
            label: 'Cardápio',
            href: '/selection',
            icon: Utensils
        },
        {
            label: 'Feedback',
            href: '/feedback',
            icon: Star
        },
        {
            label: 'Pedidos',
            href: '/orders',
            icon: Ticket
        },
        {
            label: 'Perfil',
            href: '/profile',
            icon: User
        }
    ]

    return (
        <div className="min-h-screen relative bg-gradient-to-br from-slate-50 via-white to-slate-50">
            {/* Main Content Area */}
            <div className="pb-28">
                {children}
            </div>

            {/* Bottom Navigation - Premium Glassmorphism */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl border-t border-slate-200/50 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] px-2 py-3 pb-6 z-50 grid grid-cols-4 items-center">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/selection' && pathname.startsWith(item.href))
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center justify-center gap-1 group active:scale-95 transition-all duration-200"
                        >
                            <div
                                className={cn(
                                    "relative p-2 rounded-xl transition-all duration-300",
                                    isActive
                                        ? "shadow-lg shadow-brand-900/20 text-white"
                                        : "bg-transparent group-hover:bg-slate-100 text-slate-400 group-hover:text-slate-600"
                                )}
                                style={isActive ? { backgroundColor: '#0F2A1D' } : {}}
                            >
                                <Icon
                                    className="w-5 h-5 transition-colors"
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                            </div>

                            <span
                                className={cn(
                                    "text-[10px] font-semibold tracking-wide transition-colors duration-300",
                                    !isActive && "text-slate-400 group-hover:text-slate-600"
                                )}
                                style={isActive ? { color: '#0F2A1D' } : {}}
                            >
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}

