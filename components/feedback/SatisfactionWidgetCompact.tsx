'use client'

import { useEffect, useState } from 'react'
import { Star, Loader2, ArrowUpRight, Smile, Meh, Frown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { getTodayMetrics, type TodayMetrics } from '@/lib/feedbackService'
import { useRouter } from 'next/navigation'

/**
 * Compact Satisfaction Widget for Manager Sidebar
 * Shows only: Average rating + stars + count
 * Clicking navigates to /admin/reports for full details
 */
export function SatisfactionWidgetCompact({ date }: { date?: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [metrics, setMetrics] = useState<TodayMetrics | null>(null)

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            const data = await getTodayMetrics(date)
            setMetrics(data)
            setLoading(false)
        }
        fetchData()

        // Refresh every 60 seconds
        const interval = setInterval(fetchData, 60000)
        return () => clearInterval(interval)
    }, [date])

    const isToday = !date || date === new Date().toISOString().split('T')[0]
    const dateLabel = isToday ? 'hoje' : 'neste dia'

    const handleClick = () => {
        router.push('/admin/reports')
    }

    // Render stars
    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${star <= Math.round(rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-brand-100 fill-brand-50'
                            }`}
                    />
                ))}
            </div>
        )
    }

    if (loading) {
        return (
            <Card className="border border-slate-200/60 shadow-sm bg-white/60 backdrop-blur-xl rounded-2xl">
                <CardContent className="p-4 flex items-center justify-center min-h-[100px]">
                    <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card
            className="border border-slate-200/60 shadow-sm bg-white/60 backdrop-blur-xl hover:bg-white/70 hover:shadow-md transition-all cursor-pointer group rounded-2xl"
            onClick={handleClick}
        >
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Star Icon */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${metrics && metrics.averageRating >= 4 ? 'bg-green-100/80 border border-green-200/50' :
                            metrics && metrics.averageRating >= 3 ? 'bg-amber-100/80 border border-amber-200/50' :
                                metrics && metrics.totalFeedbacks > 0 ? 'bg-red-100/80 border border-red-200/50' : 'bg-white/60 border border-slate-200/50'
                            }`}>
                            {metrics && metrics.totalFeedbacks > 0 ? (
                                metrics.averageRating >= 4 ? (
                                    <Smile className="w-5 h-5 text-green-600" />
                                ) : metrics.averageRating >= 3 ? (
                                    <Meh className="w-5 h-5 text-amber-600" />
                                ) : (
                                    <Frown className="w-5 h-5 text-red-600" />
                                )
                            ) : (
                                <Star className="w-5 h-5 text-brand-200" />
                            )}
                        </div>

                        {/* Rating Info */}
                        <div>
                            {metrics && metrics.totalFeedbacks > 0 ? (
                                <>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold text-brand-900">
                                            {metrics.averageRating.toFixed(1)}
                                        </span>
                                        {renderStars(metrics.averageRating)}
                                    </div>
                                    <p className="text-xs text-brand-600">
                                        {metrics.totalFeedbacks} {metrics.totalFeedbacks === 1 ? 'avaliação' : 'avaliações'} {dateLabel}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm font-medium text-brand-800">Satisfação</p>
                                    <p className="text-xs text-brand-600">Sem avaliações {dateLabel}</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Arrow Icon */}
                    <ArrowUpRight className="w-4 h-4 text-brand-600 group-hover:text-brand-800 transition-colors" />
                </div>
            </CardContent>
        </Card>
    )
}
