import { AdminSidebar, MobileSidebar } from '@/components/admin/Sidebar'

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
            <div className="flex-1 md:ml-64 min-h-screen flex flex-col transition-all duration-300">

                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b h-16 flex items-center px-4 sticky top-0 z-40 shadow-sm">
                    <MobileSidebar />
                    <span className="ml-4 font-bold text-lg text-slate-800">FoodSync Admin</span>
                </header>

                {children}
            </div>
        </div>
    )
}
