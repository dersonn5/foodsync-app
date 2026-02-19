'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

interface SidebarContextType {
    collapsed: boolean
    toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType>({
    collapsed: false,
    toggleSidebar: () => { },
})

const STORAGE_KEY = 'kitchenos_sidebar_collapsed'

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [collapsed, setCollapsed] = useState(false)

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored === 'true') setCollapsed(true)
    }, [])

    const toggleSidebar = useCallback(() => {
        setCollapsed(prev => {
            const next = !prev
            localStorage.setItem(STORAGE_KEY, String(next))
            return next
        })
    }, [])

    return (
        <SidebarContext.Provider value={{ collapsed, toggleSidebar }}>
            {children}
        </SidebarContext.Provider>
    )
}

export const useSidebar = () => useContext(SidebarContext)
