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
export function SatisfactionWidgetCompact() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [metrics, setMetrics] = useState<TodayMetrics | null>(null)

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            const data = await getTodayMetrics()
            setMetrics(data)
            setLoading(false)
        }
        fetchData()

        // Refresh every 60 seconds
        const interval = setInterval(fetchData, 60000)
        return () => clearInterval(interval)
    }, [])

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
                            : 'text-zinc-200 fill-zinc-100'
                            }`}
                    />
                ))}
            </div>
        )
    }

    if (loading) {
        return (
            <Card className="border-zinc-200 shadow-sm bg-white">
                <CardContent className="p-4 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card
            className="border-zinc-200 shadow-sm bg-white hover:bg-zinc-50 transition-colors cursor-pointer group"
            onClick={handleClick}
        >
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Star Icon */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${metrics && metrics.averageRating >= 4 ? 'bg-green-100' :
                                metrics && metrics.averageRating >= 3 ? 'bg-amber-100' :
                                    metrics && metrics.totalFeedbacks > 0 ? 'bg-red-100' : 'bg-zinc-100'
                            }`}>
                            {metrics && metrics.totalFeedbacks > 0 ? (
                                <span className="text-xl">
                                    {metrics.averageRating >= 4 ? '😊' :
                                        metrics.averageRating >= 3 ? '😐' : '😔'}
                                </span>
                            ) : (
                                <Star className="w-5 h-5 text-zinc-300" />
                            )}
                        </div>

                        {/* Rating Info */}
                        <div>
                            {metrics && metrics.totalFeedbacks > 0 ? (
                                <>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold text-zinc-800">
                                            {metrics.averageRating.toFixed(1)}
                                        </span>
                                        {renderStars(metrics.averageRating)}
                                    </div>
                                    <p className="text-xs text-zinc-500">
                                        {metrics.totalFeedbacks} {metrics.totalFeedbacks === 1 ? 'avaliação' : 'avaliações'} hoje
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm font-medium text-zinc-600">Satisfação</p>
                                    <p className="text-xs text-zinc-400">Sem avaliações hoje</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Arrow Icon */}
                    <ArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                </div>
            </CardContent>
        </Card>
    )
}
