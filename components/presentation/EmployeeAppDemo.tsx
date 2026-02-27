'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Bell, CheckCircle2, Star, Send, ChefHat } from 'lucide-react'
import Image from 'next/image'

/* ─────────────────────────────────────────────
   Animated Employee App Demo
   3 screens that auto-cycle:
   1. Meal Selection  →  2. Morning Check-in  →  3. Feedback
   ───────────────────────────────────────────── */

const SCREEN_DURATION = 3500 // ms per screen

function PhoneHeader() {
    return (
        <>
            {/* Dynamic Island */}
            <div className="absolute top-0 inset-x-0 h-6 bg-[#0F2A1D] rounded-b-2xl z-30 w-36 mx-auto flex justify-center items-end pb-1">
                <div className="w-12 h-1.5 bg-black/30 rounded-full" />
            </div>

            {/* App Header */}
            <div className="bg-white pt-8 pb-3 px-4 shadow-sm z-20 relative">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-2.5 items-center">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <User className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="text-[14px] font-bold text-slate-900 leading-tight">Olá, Anderson</div>
                            <div className="text-[10px] text-slate-500 font-medium tracking-tight">Terça, 27 de Fev</div>
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center relative">
                        <Bell className="w-4 h-4 text-slate-600" />
                        <div className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
                    </div>
                </div>

                {/* Date Scroller */}
                <div className="flex gap-2 overflow-hidden -mx-2 px-2 pb-1">
                    {[
                        { d: '25', w: 'Dom' },
                        { d: '26', w: 'Seg' },
                        { d: '27', w: 'Ter', active: true },
                        { d: '28', w: 'Qua' },
                        { d: '01', w: 'Qui' }
                    ].map((day, i) => (
                        <div key={i} className={`flex-shrink-0 flex flex-col items-center justify-center w-11 py-2 rounded-xl transition-colors ${day.active ? 'bg-[#0F2A1D] text-white shadow-md shadow-[#0F2A1D]/20' : 'border border-slate-100 bg-white text-slate-400'}`}>
                            <span className={`text-[8px] font-bold uppercase mb-0.5 ${day.active ? 'text-emerald-400/90' : 'text-slate-400'}`}>{day.w}</span>
                            <span className={`text-[13px] font-bold ${day.active ? 'text-white' : 'text-slate-700'}`}>{day.d}</span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

/* ── Screen 1: Meal Selection ── */
function ScreenSelection({ onSelect }: { onSelect: () => void }) {
    const [selected, setSelected] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setSelected(true)
            setTimeout(onSelect, 800)
        }, 1800)
        return () => clearTimeout(timer)
    }, [onSelect])

    return (
        <div className="flex-1 overflow-hidden p-4 flex flex-col gap-3 relative z-10">
            {/* Meal Type tabs */}
            <div className="flex gap-1.5 relative z-10 w-full overflow-hidden">
                <div className="px-3.5 py-1.5 rounded-full bg-[#0F2A1D] text-white text-[11px] font-bold shadow-sm shrink-0">Almoço</div>
                <div className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-500 text-[11px] font-semibold flex items-center gap-1 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Jantar</div>
                <div className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-500 text-[11px] font-semibold shrink-0">Ceia</div>
            </div>

            {/* Title */}
            <div>
                <h3 className="text-[13px] font-bold text-slate-900 mb-0.5">Cardápio do Dia</h3>
                <p className="text-[10px] text-slate-500 leading-tight">Selecione sua refeição principal</p>
            </div>

            {/* Dish Card */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex-1 flex flex-col pb-3">
                <div className="relative h-28 w-full bg-slate-100 border-b border-slate-50">
                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-100/80 to-amber-50" />
                    <Image src="/dishes/strogonoff_frango.png" alt="Strogonoff" fill className="object-cover" />
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-white/90 backdrop-blur-sm text-[9px] font-bold text-slate-700 shadow-sm flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" /> 4.8
                    </div>
                </div>
                <div className="p-3 flex flex-col flex-1">
                    <div className="text-[10px] text-emerald-600 font-bold mb-0.5 uppercase tracking-wide">Opção Padrão</div>
                    <h4 className="text-[14px] font-bold text-slate-900 leading-tight mb-1.5 tracking-tight">Strogonoff de Frango</h4>
                    <p className="text-[9px] text-slate-500 mb-2.5 leading-relaxed flex-1">
                        Acompanha arroz branco soltinho e batata palha extra crocante.
                    </p>

                    <div className="flex flex-wrap gap-1 mb-3">
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 border border-amber-100 text-amber-700 text-[8px] font-bold">🌾 Glúten</span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 border border-blue-100 text-blue-700 text-[8px] font-bold">🥛 Lactose</span>
                    </div>

                    <motion.button
                        animate={selected ? { scale: [1, 0.95, 1], backgroundColor: '#059669' } : {}}
                        transition={{ duration: 0.3 }}
                        className={`w-full py-2.5 rounded-xl font-bold tracking-wide text-[12px] shadow-sm transition-all flex items-center justify-center gap-1.5 ${selected ? 'bg-emerald-600 text-white' : 'bg-emerald-600 text-white'}`}
                    >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {selected ? 'Selecionado ✓' : 'Selecionar Opção'}
                    </motion.button>
                </div>
            </div>
        </div>
    )
}

/* ── Screen 2: Morning Check-in ── */
function ScreenCheckIn({ onConfirm }: { onConfirm: () => void }) {
    const [confirmed, setConfirmed] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setConfirmed(true)
            setTimeout(onConfirm, 800)
        }, 2000)
        return () => clearTimeout(timer)
    }, [onConfirm])

    return (
        <div className="flex-1 overflow-hidden p-4 flex flex-col gap-4 relative z-10">
            {/* Status Badge */}
            <div className="flex items-center justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Reserva pendente — confirme sua presença
                </div>
            </div>

            {/* Reservation Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center overflow-hidden relative">
                            <Image src="/dishes/strogonoff_frango.png" alt="Strogonoff" fill className="object-cover" />
                        </div>
                        <div>
                            <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wide">Almoço de Hoje</div>
                            <div className="text-[14px] font-bold text-slate-900 leading-tight">Strogonoff de Frango</div>
                            <div className="text-[9px] text-slate-400 mt-0.5">Arroz branco + Batata palha</div>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3 mb-4">
                        <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-500 font-medium">Horário de servir</span>
                            <span className="font-bold text-slate-800">11:30 — 13:30</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] mt-2">
                            <span className="text-slate-500 font-medium">Status</span>
                            <span className={`font-bold ${confirmed ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {confirmed ? '✓ Confirmado' : '⏳ Pendente'}
                            </span>
                        </div>
                    </div>
                </div>

                <motion.button
                    animate={confirmed ? { scale: [1, 0.95, 1], backgroundColor: '#059669' } : {}}
                    transition={{ duration: 0.3 }}
                    className={`w-full py-3 rounded-xl font-bold tracking-wide text-[13px] shadow-md transition-all flex items-center justify-center gap-2 ${confirmed ? 'bg-emerald-600 text-white shadow-emerald-600/20' : 'bg-emerald-600 text-white shadow-emerald-600/30'}`}
                >
                    <CheckCircle2 className="w-4 h-4" />
                    {confirmed ? 'Presença Confirmada ✓' : 'Confirmar Presença Hoje'}
                </motion.button>
            </div>
        </div>
    )
}

/* ── Screen 3: Feedback / Rating ── */
function ScreenFeedback({ onSend }: { onSend: () => void }) {
    const [rating, setRating] = useState(0)
    const [typing, setTyping] = useState(false)
    const [text, setText] = useState('')
    const [sent, setSent] = useState(false)
    const fullText = 'Strogonoff muito bom! Arroz soltinho.'

    useEffect(() => {
        // Animate star rating
        const starTimers = [0, 1, 2, 3, 4].map((i) =>
            setTimeout(() => setRating(i + 1), 600 + i * 250)
        )

        // Start typing after stars
        const typingTimer = setTimeout(() => {
            setTyping(true)
            let charIndex = 0
            const typeInterval = setInterval(() => {
                charIndex++
                setText(fullText.substring(0, charIndex))
                if (charIndex >= fullText.length) {
                    clearInterval(typeInterval)
                    // Send after typing
                    setTimeout(() => {
                        setSent(true)
                        setTimeout(onSend, 800)
                    }, 600)
                }
            }, 50)
        }, 2200)

        return () => {
            starTimers.forEach(clearTimeout)
            clearTimeout(typingTimer)
        }
    }, [onSend])

    return (
        <div className="flex-1 overflow-hidden p-4 flex flex-col gap-3 relative z-10">
            {/* Title */}
            <div className="text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[9px] font-bold mb-2">
                    <CheckCircle2 className="w-3 h-3" /> Refeição Consumida
                </div>
                <h3 className="text-[13px] font-bold text-slate-900">Como foi sua refeição?</h3>
                <p className="text-[9px] text-slate-500 mt-0.5">Sua opinião melhora o cardápio</p>
            </div>

            {/* Dish mini preview */}
            <div className="flex items-center gap-3 bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-amber-50 overflow-hidden relative flex-shrink-0">
                    <Image src="/dishes/strogonoff_frango.png" alt="Strogonoff" fill className="object-cover" />
                </div>
                <div>
                    <div className="text-[11px] font-bold text-slate-900">Strogonoff de Frango</div>
                    <div className="text-[8px] text-slate-400">Almoço • 27 Fev</div>
                </div>
            </div>

            {/* Star Rating */}
            <div className="flex justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <motion.div
                        key={star}
                        animate={rating >= star ? { scale: [0.5, 1.3, 1], opacity: 1 } : { opacity: 0.25 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Star
                            className={`w-8 h-8 transition-colors ${rating >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                        />
                    </motion.div>
                ))}
            </div>

            {rating === 5 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-[10px] font-bold text-amber-600"
                >
                    Excelente! ⭐
                </motion.div>
            )}

            {/* Text feedback */}
            <div className="bg-white rounded-xl border border-slate-200 p-3 flex-1 flex flex-col">
                <div className="text-[9px] text-slate-400 font-semibold mb-1.5 uppercase tracking-wider">Comentário (opcional)</div>
                <div className="flex-1 min-h-[40px]">
                    <p className="text-[11px] text-slate-700 leading-relaxed">
                        {text}
                        {typing && !sent && <span className="inline-block w-0.5 h-3 bg-slate-800 animate-pulse ml-0.5 align-middle" />}
                    </p>
                </div>
            </div>

            {/* Send button */}
            <motion.button
                animate={sent ? { scale: [1, 0.95, 1], backgroundColor: '#059669' } : {}}
                transition={{ duration: 0.3 }}
                className={`w-full py-2.5 rounded-xl font-bold tracking-wide text-[12px] shadow-sm transition-all flex items-center justify-center gap-1.5 ${sent ? 'bg-emerald-600 text-white' : 'bg-[#0F2A1D] text-white'}`}
            >
                {sent ? (
                    <><CheckCircle2 className="w-3.5 h-3.5" /> Feedback Enviado ✓</>
                ) : (
                    <><Send className="w-3.5 h-3.5" /> Enviar Avaliação</>
                )}
            </motion.button>
        </div>
    )
}

/* ── Step Indicator ── */
function StepIndicator({ current }: { current: number }) {
    const steps = ['Cardápio', 'Check-in', 'Avaliação']
    return (
        <div className="flex items-center justify-center gap-1.5 pt-4">
            {steps.map((label, i) => (
                <div key={i} className="flex items-center gap-1.5">
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold transition-all duration-300 ${i === current ? 'bg-[#0F2A1D] text-white scale-105' : i < current ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                        {i < current && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {label}
                    </div>
                    {i < steps.length - 1 && (
                        <div className={`w-4 h-px transition-colors ${i < current ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                    )}
                </div>
            ))}
        </div>
    )
}

/* ── Main Component ── */
export default function EmployeeAppDemo() {
    const [currentScreen, setCurrentScreen] = useState(0)
    const [key, setKey] = useState(0)

    const nextScreen = () => {
        if (currentScreen < 2) {
            setCurrentScreen(prev => prev + 1)
        } else {
            // Reset cycle
            setTimeout(() => {
                setCurrentScreen(0)
                setKey(prev => prev + 1)
            }, 1200)
        }
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative w-[280px] h-[580px] rounded-[40px] border-[8px] border-[#0F2A1D] bg-[#f8fafc] overflow-hidden shadow-2xl shadow-[#0F2A1D]/15 flex flex-col">
                <PhoneHeader />

                {/* Animated Screen Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${currentScreen}-${key}`}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.35 }}
                        className="flex-1 flex flex-col overflow-hidden"
                    >
                        {currentScreen === 0 && <ScreenSelection onSelect={nextScreen} />}
                        {currentScreen === 1 && <ScreenCheckIn onConfirm={nextScreen} />}
                        {currentScreen === 2 && <ScreenFeedback onSend={nextScreen} />}
                    </motion.div>
                </AnimatePresence>

                {/* Bottom Nav (iOS style strip) */}
                <div className="absolute bottom-1 w-full flex justify-center pb-2 pt-4 bg-gradient-to-t from-white via-white to-transparent z-20">
                    <div className="w-32 h-1.5 bg-slate-200 rounded-full" />
                </div>
            </div>

            {/* Step indicator below phone */}
            <StepIndicator current={currentScreen} />
        </div>
    )
}
