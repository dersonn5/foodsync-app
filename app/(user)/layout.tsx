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
        <div className="min-h-screen relative bg-gradient-to-br from-stone-50 via-white to-stone-100">
            {/* Main Content Area */}
            <div className="pb-28">
                {children}
            </div>

            {/* Bottom Navigation - Premium Glassmorphism */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl border-t border-stone-200/50 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] px-2 py-3 pb-6 z-50 grid grid-cols-4 items-center">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/selection' && pathname.startsWith(item.href))
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center justify-center gap-1 group active:scale-95 transition-all duration-200"
                        >
                            <div className={cn(
                                "relative p-2 rounded-xl transition-all duration-300",
                                isActive
                                    ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25"
                                    : "bg-transparent group-hover:bg-stone-100"
                            )}>
                                <Icon
                                    className={cn(
                                        "w-5 h-5 transition-colors",
                                        isActive ? "text-white" : "text-stone-400 group-hover:text-stone-600"
                                    )}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                            </div>

                            <span className={cn(
                                "text-[10px] font-semibold tracking-wide transition-colors duration-300",
                                isActive ? "text-emerald-700" : "text-stone-400 group-hover:text-stone-600"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}

