'use client'

import { AdminSidebar, menuItems } from '@/components/admin/Sidebar'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Desktop Sidebar (Fixed) */}
            <AdminSidebar />

            {/* Main Content Wrapper */}
            <div className="flex-1 md:ml-64 min-h-screen flex flex-col transition-all duration-300 pb-24 md:pb-0">
                {children}
            </div>

            {/* Mobile Bottom Navigation */}
            <AdminBottomNav />
        </div>
    )
}

function AdminBottomNav() {
    const pathname = usePathname()

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 px-6 py-3 pb-6 z-50 grid grid-cols-5 items-center shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] pb-safe">
            {menuItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                const Icon = item.icon

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`
                            flex flex-col items-center justify-center gap-1 transition-all duration-300 w-full active:scale-95
                            ${isActive ? "text-green-600" : "text-slate-300 hover:text-slate-500"}
                        `}
                    >
                        <div className={`
                            p-1.5 rounded-full transition-all duration-300 relative
                            ${isActive ? "bg-green-50 -translate-y-2 shadow-lg shadow-green-100 ring-2 ring-white" : ""}
                        `}>
                            <Icon className={`w-5 h-5 ${isActive ? "fill-green-600" : "fill-transparent"}`} />
                        </div>
                    </Link>
                )
            })}
        </nav>
    )
}
