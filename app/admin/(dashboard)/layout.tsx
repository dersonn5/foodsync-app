import { AdminSidebar } from '@/components/admin/Sidebar'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content Wrapper */}
            {/* ml-64 to match sidebar width */}
            <div className="flex-1 ml-64 flex flex-col min-h-screen transition-all duration-300">
                {children}
            </div>
        </div>
    )
}
