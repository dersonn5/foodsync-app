'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

export type Notification = {
    id: string
    title: string
    message: string
    time: Date
    read: boolean
}

type NotificationContextType = {
    notifications: Notification[]
    unreadCount: number
    markAsRead: (id?: string) => void
    clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const supabase = createClient()
    const audioRef = useRef<HTMLAudioElement | null>(null)

    // Initialize Audio
    useEffect(() => {
        audioRef.current = new Audio('/notification.mp3') // Changed to .mp3 as per user prompt
        audioRef.current.volume = 0.5
    }, [])

    const playSound = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0
            audioRef.current.play().catch(e => console.warn("Audio autoplay blocked:", e))
        }
    }

    const addNotification = (title: string, message: string) => {
        const newNotif: Notification = {
            id: crypto.randomUUID(),
            title,
            message,
            time: new Date(),
            read: false
        }
        setNotifications(prev => [newNotif, ...prev])
        playSound()
        toast.info(title, {
            description: message,
            position: 'bottom-right',
            duration: 5000,
        })
    }

    useEffect(() => {
        // Subscribe to NEW orders
        const channel = supabase
            .channel('realtime-orders')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'orders' },
                (payload) => {
                    addNotification('Novo Pedido!', `Um novo pedido foi realizado.`)
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'orders' },
                (payload: any) => {
                    if (payload.new.status === 'confirmed' && payload.old.status !== 'confirmed') {
                        addNotification('Pedido Confirmado', `Um pedido foi marcado como confirmado.`)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase])

    const markAsRead = (id?: string) => {
        if (id) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
        } else {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        }
    }

    const clearAll = () => {
        setNotifications([])
    }

    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, clearAll }}>
            {children}
        </NotificationContext.Provider>
    )
}

export const useNotifications = () => {
    const context = useContext(NotificationContext)
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider')
    }
    return context
}
