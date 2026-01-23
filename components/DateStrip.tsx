'use client'

import { addDays, format, isSameDay, startOfToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion } from 'framer-motion'

interface DateStripProps {
    selectedDate: Date
    onSelectDate: (date: Date) => void
}

export default function DateStrip({ selectedDate, onSelectDate }: DateStripProps) {
    const startDate = startOfToday()
    const days = Array.from({ length: 14 }).map((_, i) => addDays(startDate, i)) // Extended to 2 weeks for better scroll feel

    return (
        <div className="w-full">
            <div className="flex overflow-x-auto gap-3 px-6 pb-4 scrollbar-hide snap-x">
                {days.map((date) => {
                    const isSelected = isSameDay(date, selectedDate)
                    const isToday = isSameDay(date, startDate)

                    return (
                        <motion.button
                            key={date.toISOString()}
                            onClick={() => onSelectDate(date)}
                            whileTap={{ scale: 0.95 }}
                            animate={{
                                scale: isSelected ? 1.05 : 1,
                                opacity: isSelected ? 1 : 0.6
                            }}
                            className={`
                                flex flex-col items-center justify-center min-w-[3.5rem] h-16 rounded-2xl transition-all duration-300 snap-start relative overflow-hidden
                                ${isSelected
                                    ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                                    : 'bg-slate-50 text-slate-400 border border-slate-100'
                                }
                            `}
                        >
                            <span className={`text-[10px] font-bold uppercase tracking-wide leading-none mb-1 ${isSelected ? 'text-green-100' : ''}`}>
                                {isToday ? 'Hj' : format(date, 'EEE', { locale: ptBR }).replace('.', '').slice(0, 3)}
                            </span>
                            <span className={`text-xl font-bold leading-none ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                                {format(date, 'dd')}
                            </span>
                        </motion.button>
                    )
                })}
            </div>
        </div>
    )
}
