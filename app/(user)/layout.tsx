'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Utensils, Ticket, User, Home } from 'lucide-react'
import { cn } from '@/lib/utils' // Assuming standard shadcn utils, or I can implement minimal inline

export default function UserLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    const navItems = [
        {
            label: 'Cardápio',
            href: '/selection',
            icon: Utensils
        },
        {
            label: 'Meus Pedidos',
            href: '/orders',
            icon: Ticket
        },
        {
            label: 'Perfil',
            href: '/profile', // Placeholder
            icon: User
        }
    ]

    return (
        <div className="min-h-screen bg-slate-50 relative">
            {/* Main Content Area - Padding bottom for nav bar */}
            <div className="pb-24">
                {children}
            </div>

            {/* Bottom Navigation Web App Style */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 px-6 py-3 pb-6 z-40 grid grid-cols-3 items-center shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] pb-safe">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/selection' && pathname.startsWith(item.href))
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 transition-all duration-300 w-full active:scale-95",
                                isActive ? "text-green-600" : "text-slate-300 hover:text-slate-500"
                            )}
                        >
                            <div className={cn(
                                "p-1.5 rounded-full transition-all duration-300 relative",
                                isActive ? "bg-green-50 -translate-y-2 shadow-lg shadow-green-100 ring-2 ring-white" : ""
                            )}>
                                <Icon className={cn("w-6 h-6", isActive ? "fill-green-600" : "fill-transparent")} />
                                {isActive && (
                                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold tracking-wide animate-in fade-in slide-in-from-bottom-2">
                                        {item.label}
                                    </span>
                                )}
                            </div>
                            {!isActive && (
                                <span className="text-[10px] font-bold tracking-wide">
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
