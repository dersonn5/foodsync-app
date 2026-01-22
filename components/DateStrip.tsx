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
    const startDate = startOfToday()
    const days = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i))

    return (
        <div className="w-full pt-1 pb-2">
            <div className="px-1 mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 tracking-tight">
                    <CalendarDays className="w-4 h-4 text-green-600" />
                    Agenda Semanal
                </h2>
                <span className="text-xs font-medium text-gray-400 capitalize bg-gray-50 px-2 py-1 rounded-md">
                    {format(selectedDate, "MMMM", { locale: ptBR })}
                </span>
            </div>

            <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide snap-x px-1 -mx-1">
                {days.map((date) => {
                    const isSelected = isSameDay(date, selectedDate)
                    const isToday = isSameDay(date, startDate)

                    return (
                        <motion.button
                            key={date.toISOString()}
                            onClick={() => onSelectDate(date)}
                            whileTap={{ scale: 0.92 }}
                            animate={{
                                scale: isSelected ? 1.05 : 1,
                                opacity: isSelected ? 1 : 0.7
                            }}
                            className={`
                                flex flex-col items-center justify-center min-w-[4.2rem] h-20 rounded-2xl transition-all duration-300 snap-start relative overflow-hidden group
                                ${isSelected
                                    ? 'bg-green-600 text-white shadow-[0_8px_20px_-6px_rgba(22,163,74,0.4)]'
                                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                }
                            `}
                        >
                            <span className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 z-10 ${isSelected ? 'text-green-100' : ''}`}>
                                {isToday ? 'Hoje' : format(date, 'EEE', { locale: ptBR }).replace('.', '')}
                            </span>
                            <span className={`text-2xl font-bold z-10 ${isSelected ? 'text-white' : 'text-gray-900 group-hover:scale-110 transition-transform'}`}>
                                {format(date, 'dd')}
                            </span>

                            {/* Subtle glossy effect for selected */}
                            {isSelected && (
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                            )}
                        </motion.button>
                    )
                })}
            </div>
        </div>
    )
}
