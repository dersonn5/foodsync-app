'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Send, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react'

import { StarRating } from '@/components/feedback/StarRating'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
    isWithinFeedbackWindow,
    getFeedbackCutoffMessage,
    submitFeedback,
    hasSubmittedToday
} from '@/lib/feedbackService'

export default function FeedbackPage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [alreadySubmitted, setAlreadySubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const canSubmit = isWithinFeedbackWindow()
    const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })

    // Auth + Check existing feedback
    useEffect(() => {
        const stored = localStorage.getItem('foodsync_user')
        if (stored) {
            const userData = JSON.parse(stored)
            setUser(userData)

            // Check if already submitted today
            hasSubmittedToday(userData.id).then(hasSubmitted => {
                if (hasSubmitted) {
                    setAlreadySubmitted(true)
                }
            })
        } else {
            router.push('/')
        }
    }, [router])

    const handleSubmit = async () => {
        if (!user || rating === 0 || submitting) return

        setSubmitting(true)
        setError(null)

        const result = await submitFeedback({
            funcionarioId: user.id,
            nota: rating,
            comentario: comment
        })

        setSubmitting(false)

        if (result.success) {
            setSubmitted(true)
        } else {
            setError(result.error || 'Erro ao enviar avaliação.')
        }
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            </div>
        )
    }

    // Already submitted message
    if (alreadySubmitted && !submitted) {
        return (
            <div className="flex flex-col min-h-screen bg-slate-50">
                <header className="bg-white shadow-sm px-6 pt-12 pb-6">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 mb-4">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">Voltar</span>
                    </button>
                    <h1 className="text-2xl font-bold text-slate-800">Avaliação da Refeição</h1>
                    <p className="text-slate-500 text-sm capitalize mt-1">{today}</p>
                </header>

                <main className="flex-1 flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Avaliação já enviada!</h2>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto">
                            Você já avaliou a refeição de hoje. Obrigado pelo seu feedback!
                        </p>
                        <Button
                            onClick={() => router.push('/selection')}
                            className="mt-8 bg-green-600 hover:bg-green-700"
                        >
                            Voltar ao Cardápio
                        </Button>
                    </motion.div>
                </main>
            </div>
        )
    }

    // Time lock message
    if (!canSubmit) {
        return (
            <div className="flex flex-col min-h-screen bg-slate-50">
                <header className="bg-white shadow-sm px-6 pt-12 pb-6">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 mb-4">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">Voltar</span>
                    </button>
                    <h1 className="text-2xl font-bold text-slate-800">Avaliação da Refeição</h1>
                    <p className="text-slate-500 text-sm capitalize mt-1">{today}</p>
                </header>

                <main className="flex-1 flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-10 h-10 text-amber-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Período Encerrado</h2>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto">
                            {getFeedbackCutoffMessage()}
                        </p>
                        <p className="text-slate-400 text-xs mt-4">
                            Volte amanhã até às 15h para avaliar.
                        </p>
                        <Button
                            onClick={() => router.push('/selection')}
                            variant="outline"
                            className="mt-8"
                        >
                            Voltar ao Cardápio
                        </Button>
                    </motion.div>
                </main>
            </div>
        )
    }

    // Success state
    if (submitted) {
        return (
            <div className="flex flex-col min-h-screen bg-slate-50">
                <main className="flex-1 flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <CheckCircle2 className="w-12 h-12 text-green-600" />
                        </motion.div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Obrigado!</h2>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto">
                            Sua avaliação foi enviada com sucesso. Seu feedback nos ajuda a melhorar!
                        </p>
                        <Button
                            onClick={() => router.push('/selection')}
                            className="mt-8 bg-green-600 hover:bg-green-700"
                        >
                            Voltar ao Cardápio
                        </Button>
                    </motion.div>
                </main>
            </div>
        )
    }

    // Main form
    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white shadow-sm px-6 pt-12 pb-6">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 mb-4">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">Voltar</span>
                </button>
                <h1 className="text-2xl font-bold text-slate-800">Avalie sua Refeição</h1>
                <p className="text-slate-500 text-sm capitalize mt-1">{today}</p>
            </header>

            {/* Form */}
            <main className="flex-1 flex flex-col p-6 pb-32">
                <div className="flex-1 flex flex-col items-center justify-center space-y-10">
                    {/* Stars */}
                    <div className="text-center">
                        <p className="text-slate-600 font-medium mb-6">Como foi a refeição de hoje?</p>
                        <StarRating
                            value={rating}
                            onChange={setRating}
                            size="lg"
                        />
                    </div>

                    {/* Comment - Always Visible */}
                    <div className="w-full max-w-md">
                        <label className="block text-sm font-medium text-slate-600 mb-2">
                            Deixe um comentário (opcional)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Opcional: Conte mais sobre sua experiência (Sabor, temperatura, etc)..."
                            rows={4}
                            className="w-full p-4 rounded-xl bg-zinc-50 border border-zinc-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none transition-all"
                            maxLength={500}
                        />
                        <p className="text-xs text-slate-400 mt-2 text-right">
                            {comment.length}/500
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-red-500 text-sm text-center bg-red-50 px-4 py-2 rounded-lg"
                        >
                            {error}
                        </motion.p>
                    )}
                </div>
            </main>

            {/* Submit Button */}
            <AnimatePresence>
                {rating > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-24 left-4 right-4 z-40"
                    >
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Enviar Avaliação
                                </>
                            )}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
