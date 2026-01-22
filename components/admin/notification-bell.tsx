'use client'

import { Bell, Check, Trash2, X } from 'lucide-react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNotifications } from '@/contexts/notification-context'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function NotificationBell() {
    const { notifications, unreadCount, markAsRead, clearAll } = useNotifications()

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:shadow-md transition-all active:scale-95 relative outline-none focus:ring-2 focus:ring-green-500/20">
                    <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-gray-700' : ''}`} />
                    {unreadCount > 0 && (
                        <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[380px] p-0 shadow-xl rounded-xl border-slate-100">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="font-semibold text-sm text-slate-800">Notificações</h4>
                    <div className="flex gap-1">
                        {unreadCount > 0 && (
                            <Button variant="ghost" size="icon" onClick={() => markAsRead()} className="h-7 w-7 text-green-600 hover:bg-green-50" title="Marcar todas como lidas">
                                <Check className="w-4 h-4" />
                            </Button>
                        )}
                        {notifications.length > 0 && (
                            <Button variant="ghost" size="icon" onClick={clearAll} className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50" title="Limpar tudo">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>

                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
                            <Bell className="w-8 h-8 opacity-20" />
                            <p className="text-xs">Nenhuma notificação recente</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`p-4 hover:bg-slate-50 transition-colors flex gap-3 ${!notif.read ? 'bg-blue-50/30' : ''}`}
                                    onClick={() => markAsRead(notif.id)}
                                >
                                    <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!notif.read ? 'bg-blue-500' : 'bg-transparent'}`} />
                                    <div className="flex-1 space-y-1">
                                        <p className={`text-sm leading-none ${!notif.read ? 'font-semibold text-slate-900' : 'font-medium text-slate-600'}`}>
                                            {notif.title}
                                        </p>
                                        <p className="text-xs text-slate-500 line-clamp-2">
                                            {notif.message}
                                        </p>
                                        <p className="text-[10px] text-slate-400 pt-1">
                                            {formatDistanceToNow(notif.time, { addSuffix: true, locale: ptBR })}
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
