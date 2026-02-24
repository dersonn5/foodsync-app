'use client'

import { useEffect, useRef } from 'react'
import { AdminSidebar, menuItems } from '@/components/admin/Sidebar'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NotificationProvider } from '@/contexts/notification-context'
import { NotificationBell } from '@/components/admin/notification-bell'
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext'
import { LayoutDashboard, ListChecks, ScanLine, UtensilsCrossed, BarChart3 } from 'lucide-react'

function AdminHeader() {
    return (
        <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-xl border-b border-slate-200/60 px-8 py-4 flex items-center justify-between">
            <div>
                <h1 className="text-xl font-bold text-brand-900 tracking-tight">Bom dia, Anderson</h1>
                <p className="text-xs text-brand-600 font-medium mt-0.5">Aqui está o resumo de hoje.</p>
            </div>
            <NotificationBell />
        </header>
    )
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const mainContentRef = useRef<HTMLDivElement>(null)
    const { collapsed } = useSidebar()

    useEffect(() => {
        if (mainContentRef.current) {
            mainContentRef.current.scrollTop = 0
        }
    }, [pathname])

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans md:h-screen md:overflow-hidden relative">
            {/* Ambient Background Blur to enhance glassmorphism */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-brand-50/30 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
            {/* Desktop Sidebar */}
            <div className="hidden md:flex">
                <AdminSidebar />
            </div>

            {/* Main Content - margin adapts to sidebar width */}
            <div
                ref={mainContentRef}
                className={`flex-1 flex flex-col transition-[margin-left] duration-300 ease-out pb-24 md:pb-0 h-auto md:h-screen overflow-visible md:overflow-y-auto ${collapsed ? 'md:ml-20' : 'md:ml-72'}`}
            >
                <AdminHeader />
                <main className="flex-1 h-full w-full">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <AdminBottomNav />
        </div>
    )
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <NotificationProvider>
            <SidebarProvider>
                <AdminLayoutInner>{children}</AdminLayoutInner>
            </SidebarProvider>
        </NotificationProvider>
    )
}

function AdminBottomNav() {
    const pathname = usePathname()

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200/60 px-6 py-3 flex justify-between items-end z-50 pb-6 shadow-sm">

            <Link
                href="/admin"
                className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/admin' ? 'text-brand-500' : 'text-brand-300 hover:text-brand-500'}`}
            >
                <LayoutDashboard size={20} className={pathname === '/admin' ? 'fill-brand-500/20' : ''} />
                <span className="text-[10px] font-medium">Home</span>
            </Link>

            <Link
                href="/admin/orders"
                className={`flex flex-col items-center gap-1 transition-colors ${pathname.startsWith('/admin/orders') ? 'text-brand-500' : 'text-brand-300 hover:text-brand-500'}`}
            >
                <ListChecks size={20} />
                <span className="text-[10px] font-medium">Pedidos</span>
            </Link>

            <div className="relative -top-5">
                <Link href="/admin/scan">
                    <div className="h-14 w-14 bg-brand-500 rounded-full flex items-center justify-center shadow-lg shadow-brand-500/30 text-white hover:scale-105 transition-transform border-4 border-brand-50">
                        <ScanLine size={24} />
                    </div>
                </Link>
            </div>

            <Link
                href="/admin/menu"
                className={`flex flex-col items-center gap-1 transition-colors ${pathname.startsWith('/admin/menu') ? 'text-brand-500' : 'text-brand-300 hover:text-brand-500'}`}
            >
                <UtensilsCrossed size={20} />
                <span className="text-[10px] font-medium">Menu</span>
            </Link>

            <Link
                href="/admin/reports"
                className={`flex flex-col items-center gap-1 transition-colors ${pathname.startsWith('/admin/reports') ? 'text-brand-500' : 'text-brand-300 hover:text-brand-500'}`}
            >
                <BarChart3 size={20} />
                <span className="text-[10px] font-medium">Gestão</span>
            </Link>

        </div>
    )
}
