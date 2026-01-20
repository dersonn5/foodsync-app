'use client'

import { addDays, format, isSameDay, startOfToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { CalendarDays } from 'lucide-react'

interface DateStripProps {
    selectedDate: Date
    onSelectDate: (date: Date) => void
}

export default function DateStrip({ selectedDate, onSelectDate }: DateStripProps) {
    // Generate next 7 days starting from today (or tomorrow if you prefer logic to start ahead)
    // The prompt implies "Monday, Tuesday..." so let's show starting from Today?
    // User requested: "next 7 days (starting from today or tomorrow)"
    // Let's start from Today to allow checking today's order (if any) or planning ahead.
    // Start from current date
    const startDate = startOfToday()

    // Safety check: ensure we don't show past dates if client time is wonky? 
    // For now, trust startOfToday().
    // If the user specifically sees 18, it means their machine thought it was 18.

    const days = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i))

    return (
        <div className="bg-white pt-2 pb-4 shadow-sm border-b border-slate-100 z-10 sticky top-0">
            <div className="px-5 mb-2 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-green-600" />
                    Agenda Semanal
                </h2>
                <span className="text-xs text-slate-400 capitalize">
                    {format(selectedDate, "MMMM, yyyy", { locale: ptBR })}
                </span>
            </div>

            <div className="flex overflow-x-auto px-5 gap-3 pb-2 scrollbar-hide snap-x">
                {days.map((date) => {
                    const isSelected = isSameDay(date, selectedDate)
                    const isToday = isSameDay(date, startDate)

                    return (
                        <motion.button
                            key={date.toISOString()}
                            onClick={() => onSelectDate(date)}
                            whileTap={{ scale: 0.95 }}
                            className={`
                                flex flex-col items-center justify-center min-w-[4.5rem] h-20 rounded-2xl border-2 transition-all snap-start
                                ${isSelected
                                    ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-200'
                                    : 'bg-white border-slate-100 text-slate-400 hover:border-green-200 hover:text-green-600'
                                }
                            `}
                        >
                            <span className="text-xs font-medium uppercase tracking-wider mb-1">
                                {isToday ? 'Hoje' : format(date, 'EEE', { locale: ptBR }).replace('.', '')}
                            </span>
                            <span className={`text-2xl font-bold ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                                {format(date, 'dd')}
                            </span>
                        </motion.button>
                    )
                })}
            </div>
        </div>
    )
}
