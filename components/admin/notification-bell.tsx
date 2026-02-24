"use client"

import { Bell, Check, X } from "lucide-react"
import { useNotifications } from "@/contexts/notification-context"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export function NotificationBell() {
    // Adapted to match Context: markAsRead handles both single and all (if no ID passed)
    const { notifications, unreadCount, markAsRead } = useNotifications()

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-brand-50 transition-colors">
                    <Bell className="h-5 w-5 text-brand-800" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-600 border-2 border-white animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-80 p-0 shadow-lg border-brand-100" align="end">
                {/* Cabeçalho */}
                <div className="flex items-center justify-between p-4 border-b border-brand-100 bg-brand-50/50">
                    <h4 className="font-semibold text-sm text-brand-900">Notificações</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead()}
                            className="text-xs text-brand-600 hover:text-brand-900 h-auto p-0 hover:bg-transparent"
                        >
                            Marcar lidas
                        </Button>
                    )}
                </div>

                {/* Lista de Notificações */}
                <ScrollArea className="h-[350px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-brand-600 gap-2">
                            <Bell className="h-8 w-8 opacity-20" />
                            <p className="text-xs">Tudo tranquilo por aqui</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`p-4 border-b border-brand-50 hover:bg-brand-50 transition-colors flex gap-3 ${!notif.read ? 'bg-brand-50/50' : ''}`}
                                >
                                    <div className={`mt-1 h-2 w-2 rounded-full flex-none ${!notif.read ? 'bg-brand-800' : 'bg-brand-200'}`} />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-brand-900 leading-tight">
                                            {notif.title}
                                        </p>
                                        <p className="text-xs text-brand-600 leading-snug">
                                            {notif.message}
                                        </p>
                                        <p className="text-[10px] text-brand-600 font-medium pt-1">
                                            {/* Context uses 'time', prompt used 'timestamp'. Adapted to use 'time'. */}
                                            {formatDistanceToNow(new Date(notif.time), { locale: ptBR, addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}
