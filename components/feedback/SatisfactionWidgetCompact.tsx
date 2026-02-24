'use client'

import { useEffect, useState } from 'react'
import { Star, Loader2, ArrowUpRight } from 'lucide-react'
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
            <Card className="border-brand-100 shadow-sm bg-white/90 backdrop-blur-sm">
                <CardContent className="p-4 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card
            className="border-brand-100 shadow-sm bg-white/90 backdrop-blur-sm hover:bg-brand-50/50 transition-colors cursor-pointer group"
            onClick={handleClick}
        >
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Star Icon */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${metrics && metrics.averageRating >= 4 ? 'bg-green-100' :
                            metrics && metrics.averageRating >= 3 ? 'bg-amber-100' :
                                metrics && metrics.totalFeedbacks > 0 ? 'bg-red-100' : 'bg-brand-50'
                            }`}>
                            {metrics && metrics.totalFeedbacks > 0 ? (
                                <span className="text-xl">
                                    {metrics.averageRating >= 4 ? '😊' :
                                        metrics.averageRating >= 3 ? '😐' : '😔'}
                                </span>
                            ) : (
                                <Star className="w-5 h-5 text-brand-200" />
                            )}
                        </div>

                        {/* Rating Info */}
                        <div>
                            {metrics && metrics.totalFeedbacks > 0 ? (
                                <>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold text-brand-500">
                                            {metrics.averageRating.toFixed(1)}
                                        </span>
                                        {renderStars(metrics.averageRating)}
                                    </div>
                                    <p className="text-xs text-brand-300">
                                        {metrics.totalFeedbacks} {metrics.totalFeedbacks === 1 ? 'avaliação' : 'avaliações'} {dateLabel}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm font-medium text-brand-400">Satisfação</p>
                                    <p className="text-xs text-brand-300">Sem avaliações {dateLabel}</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Arrow Icon */}
                    <ArrowUpRight className="w-4 h-4 text-brand-200 group-hover:text-brand-400 transition-colors" />
                </div>
            </CardContent>
        </Card>
    )
}
