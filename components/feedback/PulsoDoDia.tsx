'use client'

import { useEffect, useState } from 'react'
import { Star, MessageSquare, Loader2, TrendingUp, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getTodayMetrics, type TodayMetrics } from '@/lib/feedbackService'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function PulsoDoDia() {
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

    // Render stars
    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-5 h-5 ${star <= Math.round(rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-zinc-200 fill-zinc-100'
                            }`}
                    />
                ))}
            </div>
        )
    }

    const getEmoji = (rating: number) => {
        if (rating >= 4.5) return '🌟'
        if (rating >= 4) return '😊'
        if (rating >= 3) return '😐'
        return '😔'
    }

    if (loading) {
        return (
            <Card className="border-zinc-200 shadow-sm bg-white">
                <CardContent className="p-6 flex items-center justify-center min-h-[200px]">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-zinc-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b border-zinc-100 pb-3">
                <CardTitle className="text-zinc-800 flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    Pulso do Dia
                    <Badge variant="outline" className="ml-auto bg-white text-xs font-normal text-zinc-500">
                        Atualiza a cada 60s
                    </Badge>
                </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-100">
                    {/* Left: Average Rating */}
                    <div className="p-6">
                        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">
                            Média das Avaliações
                        </p>

                        {metrics && metrics.totalFeedbacks > 0 ? (
                            <div className="flex items-center gap-4">
                                <div className="text-5xl font-bold text-zinc-800">
                                    {metrics.averageRating.toFixed(1)}
                                </div>
                                <div>
                                    {renderStars(metrics.averageRating)}
                                    <p className="text-sm text-zinc-500 mt-1">
                                        {metrics.totalFeedbacks} {metrics.totalFeedbacks === 1 ? 'avaliação' : 'avaliações'}
                                    </p>
                                </div>
                                <div className="text-4xl ml-auto">
                                    {getEmoji(metrics.averageRating)}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 text-zinc-400">
                                <Star className="w-8 h-8 opacity-30" />
                                <p className="text-sm">Sem avaliações hoje</p>
                            </div>
                        )}
                    </div>

                    {/* Right: Recent Comments */}
                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                            <MessageSquare className="w-4 h-4 text-zinc-400" />
                            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                                Comentários Recentes
                            </p>
                        </div>

                        {metrics && metrics.recentComments.length > 0 ? (
                            <div className="space-y-3 max-h-[200px] overflow-y-auto">
                                {metrics.recentComments.map((comment, index) => (
                                    <div
                                        key={index}
                                        className={`p-3 rounded-lg ${comment.nota <= 2 ? 'bg-red-50 border border-red-100' : 'bg-zinc-50'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                {comment.nota <= 2 && (
                                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                                )}
                                                <span className="text-xs font-semibold text-zinc-700">
                                                    {comment.userName}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`w-3 h-3 ${star <= comment.nota
                                                            ? 'text-amber-400 fill-amber-400'
                                                            : 'text-zinc-200'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className={`text-sm ${comment.nota <= 2 ? 'text-red-700' : 'text-zinc-600'}`}>
                                            {comment.comentario}
                                        </p>
                                        <p className="text-xs text-zinc-400 mt-1">
                                            {formatDistanceToNow(new Date(comment.created_at), {
                                                addSuffix: true,
                                                locale: ptBR
                                            })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 text-zinc-400 py-4">
                                <MessageSquare className="w-6 h-6 opacity-30" />
                                <p className="text-sm">Nenhum comentário hoje</p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
