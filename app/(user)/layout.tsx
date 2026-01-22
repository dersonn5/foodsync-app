'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Utensils, Ticket, User } from 'lucide-react'
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
        <div className="min-h-screen relative">
            {/* Main Content Area - Padding bottom for nav bar */}
            <div className="pb-28">
                {children}
            </div>

            {/* Bottom Navigation - Elite UI/UX Glassmorphism */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t-0 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] px-6 py-4 pb-6 z-50 grid grid-cols-3 items-center">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/selection' && pathname.startsWith(item.href))
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center justify-center gap-1 group active:scale-95 transition-transform duration-200"
                        >
                            <div className={cn(
                                "transition-colors duration-300",
                                isActive ? "text-green-600 drop-shadow-sm" : "text-gray-400 group-hover:text-green-600"
                            )}>
                                <Icon className={cn("w-7 h-7", isActive && "fill-current/10")} strokeWidth={isActive ? 2.5 : 2} />
                            </div>

                            <span className={cn(
                                "text-[10px] font-bold tracking-wide transition-colors duration-300",
                                isActive ? "text-green-700" : "text-gray-400 group-hover:text-green-600"
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
