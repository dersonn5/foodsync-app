'use client'

import { createBrowserClient } from '@supabase/ssr'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function SignOutButton() {
    const router = useRouter()
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const handleLogout = async () => {
        // 1. Clear Supabase Session
        await supabase.auth.signOut()

        // 2. Clear Legacy LocalStorage (just in case)
        localStorage.removeItem('foodsync_user')

        // 3. Force Redirect
        router.push('/')
        router.refresh()
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-slate-500 hover:text-red-500 hover:bg-red-50 gap-2 transition-colors cursor-pointer"
        >
            <span className="hidden sm:inline text-xs font-medium uppercase tracking-wider">Sair</span>
            <LogOut className="w-4 h-4" />
        </Button>
    )
}
