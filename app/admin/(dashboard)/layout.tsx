'use client'

import { AdminSidebar, menuItems } from '@/components/admin/Sidebar'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell } from 'lucide-react'
import { NotificationProvider } from '@/contexts/notification-context'
import { NotificationBell } from '@/components/admin/notification-bell'

// Header Component (Local for simplicity, or extract later)
function AdminHeader() {
    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-8 py-4 flex items-center justify-between">
            <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Bom dia, Anderson</h1>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Aqui está o resumo de hoje.</p>
            </div>
            {/* Notification Bell Component */}
            <NotificationBell />
        </header>
    )
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <NotificationProvider>
            {/* Main Container: Mobile = min-h-screen (scroll), Desktop = h-screen (fixed/hidden scroll) */}
            <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans md:h-screen md:overflow-hidden">
                {/* Desktop Sidebar (Fixed & Hidden on Mobile) */}
                <div className="hidden md:flex">
                    <AdminSidebar />
                </div>

                {/* Main Content Wrapper: Mobile = auto height + padding, Desktop = full height + locked */}
                <div className="flex-1 md:ml-72 flex flex-col transition-all duration-300 pb-24 md:pb-0 h-auto md:h-screen overflow-visible md:overflow-y-auto">
                    <AdminHeader />
                    {/* Content Area: Remove padding here, handled in page.tsx. Ensure full height. */}
                    <main className="flex-1 h-full w-full">
                        {children}
                    </main>
                </div>

                {/* Mobile Bottom Navigation */}
                <AdminBottomNav />
            </div>
        </NotificationProvider>
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
