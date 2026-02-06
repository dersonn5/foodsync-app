'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Send, CheckCircle2, Loader2, ArrowLeft, Star } from 'lucide-react'

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
        const stored = localStorage.getItem('kitchenos_user')
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
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
        )
    }

    // Already submitted message
    if (alreadySubmitted && !submitted) {
        return (
            <div className="flex flex-col min-h-screen bg-transparent">
                <header className="bg-white/80 backdrop-blur-xl shadow-sm px-6 pt-12 pb-6 border-b border-stone-200/60">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-stone-400 mb-4 hover:text-stone-600 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">Voltar</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
                            <Star className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-stone-800">Avaliação da Refeição</h1>
                            <p className="text-stone-500 text-xs capitalize">{today}</p>
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h2 className="text-xl font-bold text-stone-800 mb-2">Avaliação já enviada!</h2>
                        <p className="text-stone-500 text-sm max-w-xs mx-auto">
                            Você já avaliou a refeição de hoje. Obrigado pelo seu feedback!
                        </p>
                        <Button
                            onClick={() => router.push('/selection')}
                            className="mt-8 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl shadow-lg shadow-emerald-500/25"
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
            <div className="flex flex-col min-h-screen bg-transparent">
                <header className="bg-white/80 backdrop-blur-xl shadow-sm px-6 pt-12 pb-6 border-b border-stone-200/60">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-stone-400 mb-4 hover:text-stone-600 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">Voltar</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
                            <Star className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-stone-800">Avaliação da Refeição</h1>
                            <p className="text-stone-500 text-xs capitalize">{today}</p>
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-100">
                            <Clock className="w-10 h-10 text-amber-600" />
                        </div>
                        <h2 className="text-xl font-bold text-stone-800 mb-2">Período Encerrado</h2>
                        <p className="text-stone-500 text-sm max-w-xs mx-auto">
                            {getFeedbackCutoffMessage()}
                        </p>
                        <p className="text-stone-400 text-xs mt-4">
                            Volte amanhã até às 15h para avaliar.
                        </p>
                        <Button
                            onClick={() => router.push('/selection')}
                            variant="outline"
                            className="mt-8 border-stone-200 text-stone-600 hover:bg-stone-50 rounded-xl"
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
            <div className="flex flex-col min-h-screen bg-transparent">
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
                            className="w-24 h-24 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-100"
                        >
                            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                        </motion.div>
                        <h2 className="text-2xl font-bold text-stone-800 mb-2">Obrigado!</h2>
                        <p className="text-stone-500 text-sm max-w-xs mx-auto">
                            Sua avaliação foi enviada com sucesso. Seu feedback nos ajuda a melhorar!
                        </p>
                        <Button
                            onClick={() => router.push('/selection')}
                            className="mt-8 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl shadow-lg shadow-emerald-500/25"
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
        <div className="flex flex-col min-h-screen bg-transparent">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl shadow-sm px-6 pt-12 pb-6 border-b border-stone-200/60">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-stone-400 mb-4 hover:text-stone-600 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">Voltar</span>
                </button>
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
                        <Star className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-stone-800">Avalie sua Refeição</h1>
                        <p className="text-stone-500 text-xs capitalize">{today}</p>
                    </div>
                </div>
            </header>

            {/* Form */}
            <main className="flex-1 flex flex-col p-6 pb-32">
                <div className="flex-1 flex flex-col items-center justify-center space-y-10">
                    {/* Stars */}
                    <div className="text-center">
                        <p className="text-stone-600 font-medium mb-6">Como foi a refeição de hoje?</p>
                        <StarRating
                            value={rating}
                            onChange={setRating}
                            size="lg"
                        />
                    </div>

                    {/* Comment - Always Visible */}
                    <div className="w-full max-w-md">
                        <label className="block text-sm font-medium text-stone-600 mb-2">
                            Deixe um comentário (opcional)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Opcional: Conte mais sobre sua experiência (Sabor, temperatura, etc)..."
                            rows={4}
                            className="w-full p-4 rounded-2xl bg-white border border-stone-200/60 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none transition-all text-stone-800 placeholder:text-stone-400"
                            maxLength={500}
                        />
                        <p className="text-xs text-stone-400 mt-2 text-right">
                            {comment.length}/500
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-red-600 text-sm text-center bg-red-50 px-4 py-2 rounded-xl border border-red-100"
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
                            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl shadow-xl shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-3"
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

