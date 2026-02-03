'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface StarRatingProps {
    value: number
    onChange?: (value: number) => void
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
    showLabel?: boolean
}

const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
}

const labels: Record<number, string> = {
    1: 'Muito Ruim',
    2: 'Ruim',
    3: 'Regular',
    4: 'Bom',
    5: 'Excelente'
}

export function StarRating({
    value,
    onChange,
    size = 'lg',
    disabled = false,
    showLabel = true
}: StarRatingProps) {
    const [hoverValue, setHoverValue] = useState(0)
    const displayValue = hoverValue || value

    const handleClick = (rating: number) => {
        if (!disabled && onChange) {
            onChange(rating)
        }
    }

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= displayValue
                    const isHovered = star <= hoverValue && hoverValue > 0

                    return (
                        <motion.button
                            key={star}
                            type="button"
                            onClick={() => handleClick(star)}
                            onMouseEnter={() => !disabled && setHoverValue(star)}
                            onMouseLeave={() => setHoverValue(0)}
                            disabled={disabled}
                            className={cn(
                                "relative transition-all duration-150 focus:outline-none",
                                !disabled && "cursor-pointer active:scale-90",
                                disabled && "cursor-default opacity-70"
                            )}
                            whileTap={!disabled ? { scale: 0.85 } : undefined}
                        >
                            <Star
                                className={cn(
                                    sizeClasses[size],
                                    "transition-all duration-200",
                                    isFilled
                                        ? "text-amber-400 fill-amber-400 drop-shadow-md"
                                        : "text-slate-200 fill-slate-100",
                                    isHovered && "text-amber-300 fill-amber-300 scale-110"
                                )}
                                strokeWidth={1.5}
                            />
                        </motion.button>
                    )
                })}
            </div>

            {showLabel && value > 0 && (
                <motion.p
                    key={value}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                        "text-sm font-semibold tracking-wide transition-colors",
                        value <= 2 ? "text-red-500" :
                            value === 3 ? "text-amber-600" :
                                "text-green-600"
                    )}
                >
                    {labels[value]}
                </motion.p>
            )}
        </div>
    )
}
