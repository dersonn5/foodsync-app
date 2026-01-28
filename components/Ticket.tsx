'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatDateUTC } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChefHat, QrCode } from 'lucide-react'
import QRCode from 'react-qr-code'

interface TicketProps {
    isOpen: boolean
    onClose: () => void
    order: {
        id: string
        consumption_date: string
        menu_items: {
            name: string
        }
    } | null
    userName: string
}

export default function Ticket({ isOpen, onClose, order, userName }: TicketProps) {
    if (!order) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />

                    {/* Ticket Card (Boarding Pass Style) */}
                    <motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        className="w-full max-w-sm relative z-10"
                    >
                        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl relative">
                            {/* Header Section */}
                            <div className="bg-green-600 p-6 text-white text-center pb-8 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent pointer-events-none" />
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                                    <ChefHat className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-xl font-bold tracking-tight mb-1">{order.menu_items?.name}</h2>
                                <p className="text-green-100 text-sm font-medium">Ticket de Refeição</p>
                            </div>

                            {/* Divider with Cutouts */}
                            <div className="relative h-4 bg-white -mt-2">
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-slate-900/60 rounded-r-full" />
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-slate-900/60 rounded-l-full" />
                                <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 border-b-2 border-gray-200" />
                            </div>

                            {/* Content Section */}
                            <div className="p-6 pt-2 bg-white text-center space-y-6">
                                <div className="grid grid-cols-2 gap-4 text-left">
                                    <div className="bg-gray-50 p-3 rounded-xl">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Membro</p>
                                        <p className="font-bold text-gray-900 truncate">{userName}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-xl">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Data</p>
                                        <p className="font-bold text-gray-900">
                                            {formatDateUTC(order.consumption_date, "dd/MM")}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white p-8 rounded-2xl flex flex-col items-center justify-center gap-2">
                                    <QRCode value={String(order.id)} size={180} className="w-full h-auto max-w-[180px]" />
                                    <p className="text-[10px] text-gray-300 font-mono mt-1 font-bold tracking-widest uppercase">
                                        #{order.id}
                                    </p>
                                </div>

                                <p className="text-xs text-gray-400 font-medium">
                                    Apresente este código no balcão para retirar sua refeição.
                                </p>
                            </div>
                        </div>

                        {/* Floating Close Button */}
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={onClose}
                                className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all active:scale-95 border border-white/20"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
