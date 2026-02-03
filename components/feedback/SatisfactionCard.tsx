'use client'

import { useEffect, useState } from 'react'
import { Star, MessageSquare, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getFeedbacksForDate, type FeedbackRecord } from '@/lib/feedbackService'
import { format } from 'date-fns'

interface SatisfactionCardProps {
    date?: string
}

export function SatisfactionCard({ date }: SatisfactionCardProps) {
    const [loading, setLoading] = useState(true)
    const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>([])

    const targetDate = date || format(new Date(), 'yyyy-MM-dd')

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            const data = await getFeedbacksForDate(targetDate)
            setFeedbacks(data)
            setLoading(false)
        }
        fetchData()
    }, [targetDate])

    // Calculate metrics
    const totalFeedbacks = feedbacks.length
    const averageRating = totalFeedbacks > 0
        ? feedbacks.reduce((acc, f) => acc + f.nota, 0) / totalFeedbacks
        : 0
    const recentComments = feedbacks
        .filter(f => f.comentario && f.comentario.trim().length > 0)
        .slice(0, 5)

    // Render stars
    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${star <= Math.round(rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200 fill-slate-100'
                            }`}
                    />
                ))}
            </div>
        )
    }

    return (
        <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-amber-50/50 to-white border-b border-slate-100 pb-3">
                <CardTitle className="text-slate-900 flex items-center gap-2 text-md">
                    <Star className="w-5 h-5 text-amber-500" />
                    Satisfação do Dia
                    <Badge variant="outline" className="ml-auto bg-white text-xs">
                        {totalFeedbacks} {totalFeedbacks === 1 ? 'avaliação' : 'avaliações'}
                    </Badge>
                </CardTitle>
            </CardHeader>

            <CardContent className="p-4">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                    </div>
                ) : totalFeedbacks === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                        <Star className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Sem avaliações hoje</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Average Rating */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                            <div>
                                <p className="text-xs font-medium text-slate-500 mb-1">Média Geral</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-3xl font-bold text-slate-900">
                                        {averageRating.toFixed(1)}
                                    </span>
                                    {renderStars(averageRating)}
                                </div>
                            </div>
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${averageRating >= 4 ? 'bg-green-100 text-green-600' :
                                averageRating >= 3 ? 'bg-amber-100 text-amber-600' :
                                    'bg-red-100 text-red-600'
                                }`}>
                                <span className="text-2xl">
                                    {averageRating >= 4 ? '😊' : averageRating >= 3 ? '😐' : '😔'}
                                </span>
                            </div>
                        </div>

                        {/* Recent Comments */}
                        {recentComments.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <MessageSquare className="w-4 h-4 text-slate-400" />
                                    <h4 className="text-sm font-semibold text-slate-700">Comentários Recentes</h4>
                                </div>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {recentComments.map((feedback) => (
                                        <div
                                            key={feedback.id}
                                            className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                                        >
                                            <Avatar className="h-8 w-8 flex-shrink-0">
                                                <AvatarFallback className="bg-slate-200 text-slate-600 text-xs font-bold">
                                                    {(feedback.users?.name || 'U').charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-semibold text-slate-700 truncate">
                                                        {feedback.users?.name || 'Funcionário'}
                                                    </span>
                                                    <div className="flex items-center gap-0.5">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star
                                                                key={star}
                                                                className={`w-3 h-3 ${star <= feedback.nota
                                                                    ? 'text-amber-400 fill-amber-400'
                                                                    : 'text-slate-200'
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-500 line-clamp-2">
                                                    {feedback.comentario}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
