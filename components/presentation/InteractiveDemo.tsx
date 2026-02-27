'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChefHat,
    ArrowRight,
    Utensils,
    Star,
    QrCode,
    ShieldCheck,
    Clock,
    Scan,
    CheckCircle2,
    Smartphone
} from 'lucide-react'
import Image from 'next/image'

/* ─────────────────────────────────────────────
   Design Tokens
   ───────────────────────────────────────────── */
const COLORS = {
    creme: '#FAFAF8',
    verde: '#1a5d1d',
    verdeClaro: '#2a7a2d',
    verdeMuitoClaro: '#e8f5e9',
    marrom: '#3E2723',
    pessego: '#f8b4a0',
    branco: '#ffffff',
}

/* ─────────────────────────────────────────────
   Step data
   ───────────────────────────────────────────── */
const stepsData = [
    {
        id: 1,
        badge: 'Passo 1 de 3',
        tagline: 'Cardápio Inteligente',
        title: <>Escolha trava o custo.<br />Previne desperdício.</>,
        description: 'O funcionário acessa o app de qualquer lugar e escolhe o prato. A cozinha sabe exatamente quanto producing, reduzindo o CMV (Custo de Mercadoria Vendida).',
        highlight: 'Selecione o "Strogonoff" no celular ao lado →',
        stat: { value: '-32%', label: 'de desperdício de insumos' },
    },
    {
        id: 2,
        badge: 'Passo 2 de 3',
        tagline: 'Check-in Matinal',
        title: 'Previsibilidade absoluta.',
        description: 'No dia do consumo, o colaborador abre o app e clica em um botão para confirmar que fará a refeição. Números sempre exatos e atualizados para a operação.',
        highlight: 'Clique em "Confirmar Presença" →',
        stat: { value: '100%', label: 'precisão na produção diária' },
    },
    {
        id: 3,
        badge: 'Passo 3 de 3',
        tagline: 'QR Code Instantâneo',
        title: 'Pedido confirmado. Zero filas.',
        description: 'Na hora do refeitório, o funcionário apenas apresenta o QR Code. A cozinha escaneia e valida em milissegundos. Sem papéis, sem busca por nomes, sem filas.',
        highlight: 'Faça scroll para ver a mágica na cozinha ↓',
        stat: { value: '<1s', label: 'para validar o pedido' },
    },
]

/* ─────────────────────────────────────────────
   Phone Screen Components
   ───────────────────────────────────────────── */

function PhoneScreenHome({ onAction }: { onAction: () => void }) {
    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="px-5 pt-10 pb-4">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-[#0F2A1D] flex items-center justify-center shadow-md">
                        <ChefHat className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-[11px] text-[#517252] font-semibold leading-none">Bom almoço,</p>
                        <p className="font-extrabold text-[#0F2A1D] text-lg leading-tight">Anderson</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#0F2A1D] to-[#1a5d1d] flex items-center justify-center shadow-xl shadow-[#0F2A1D]/30">
                    <Utensils className="w-10 h-10 text-white" />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="font-extrabold text-[#0F2A1D] text-lg">Cardápio Disponível</h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-[200px] mx-auto">
                        O cardápio de amanhã já está pronto. Escolha seu prato alternativo agora.
                    </p>
                </div>

                {/* Pulsating CTA */}
                <button
                    onClick={onAction}
                    className="relative mt-4 bg-[#0F2A1D] text-white font-bold text-sm px-8 py-4 rounded-2xl shadow-xl shadow-[#0F2A1D]/40 hover:bg-[#163b29] transition-colors cursor-pointer select-none"
                >
                    {/* Pulse ring */}
                    <span className="absolute inset-0 rounded-2xl animate-ping bg-[#0F2A1D]/30" />
                    <span className="relative flex items-center gap-2">
                        Fazer Pedido do Dia <ArrowRight className="w-4 h-4" />
                    </span>
                </button>
            </div>

            {/* Bottom nav */}
            <PhoneBottomNav active="cardapio" />
        </div>
    )
}

function PhoneScreenCardapio({ onAction }: { onAction: () => void }) {
    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="px-5 pt-10 pb-3 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0F2A1D] flex items-center justify-center">
                        <ChefHat className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] text-[#527252] font-semibold">Bom almoço,</p>
                        <p className="font-extrabold text-[#0F2A1D] text-base leading-tight">Anderson</p>
                    </div>
                </div>

                {/* Date Scroller */}
                <div className="flex gap-2 overflow-hidden">
                    <div className="bg-[#0F2A1D] text-white rounded-2xl min-w-[48px] flex flex-col items-center justify-center py-2 shrink-0">
                        <span className="text-[8px] font-bold uppercase text-white/70">Quinta</span>
                        <span className="text-lg font-black leading-none">26</span>
                    </div>
                    {[{ day: 'Sexta', num: '27' }, { day: 'Sáb', num: '28' }, { day: 'Dom', num: '1' }, { day: 'Seg', num: '2' }].map(d => (
                        <div key={d.num} className="bg-white text-slate-700 rounded-2xl min-w-[48px] flex flex-col items-center justify-center py-2 border border-slate-200 shrink-0 opacity-80">
                            <span className="text-[8px] font-bold uppercase text-slate-400">{d.day}</span>
                            <span className="text-lg font-black leading-none">{d.num}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-full h-px bg-slate-100" />

            {/* Pills */}
            <div className="px-5 pt-3 pb-2 flex gap-2">
                <div className="bg-[#0F2A1D] text-white text-[10px] font-bold px-3 py-1.5 rounded-xl">Todos</div>
                <div className="bg-white text-slate-600 border border-slate-200 text-[10px] font-semibold px-3 py-1.5 rounded-xl">Padrão</div>
                <div className="bg-white text-slate-600 border border-slate-200 text-[10px] font-semibold px-3 py-1.5 rounded-xl">Fit</div>
                <div className="bg-white text-slate-600 border border-slate-200 text-[10px] font-semibold px-3 py-1.5 rounded-xl">Lanche</div>
            </div>

            {/* Heading */}
            <div className="px-5 flex justify-between items-center py-2">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#0F2A1D] flex items-center justify-center">
                        <Utensils className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h3 className="font-extrabold text-[#0F2A1D] text-xs">Cardápio do Dia</h3>
                </div>
                <span className="text-[9px] font-bold text-[#3B5B3E] bg-[#E8F0E9] px-2 py-1 rounded-lg border border-[#C5D8C6]">5 Opções</span>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-hidden px-5 space-y-3 pb-16 relative">
                {/* Dish 1: Strogonoff - PULSING */}
                <button
                    onClick={onAction}
                    className="relative w-full bg-white rounded-2xl p-2.5 flex gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-slate-100 text-left cursor-pointer hover:border-[#0F2A1D]/20 transition-colors"
                >
                    {/* Pulse ring */}
                    <span className="absolute -inset-1 rounded-3xl animate-pulse bg-[#0F2A1D]/5 pointer-events-none" />
                    <div className="w-20 h-20 rounded-2xl bg-amber-100 overflow-hidden shrink-0 relative">
                        <Image src="/dishes/strogonoff_frango.png" alt="Strogonoff" fill className="object-cover" />
                    </div>
                    <div className="flex flex-col flex-1 py-0.5 pr-1">
                        <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Padrão</p>
                        <h4 className="font-extrabold text-[#0F2A1D] text-[11px] leading-tight mb-1">Strogonoff de Frango</h4>
                        <p className="text-[8px] text-slate-500 leading-[1.3] line-clamp-2">Arroz, Strogonoff de Frango, Batata Palha e Salada de Alface.</p>
                        <div className="flex justify-between items-center mt-auto pt-1">
                            <span className="text-[9px] font-bold text-slate-400">450kcal</span>
                            <div className="w-6 h-6 rounded-lg bg-[#0F2A1D] flex items-center justify-center shadow-md">
                                <ArrowRight className="w-3 h-3 text-white" />
                            </div>
                        </div>
                    </div>
                </button>

                {/* Dish 2: Faded */}
                <div className="bg-white rounded-2xl p-2.5 flex gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-slate-100 opacity-60">
                    <div className="w-20 h-20 rounded-2xl bg-orange-100 overflow-hidden shrink-0 relative">
                        <Image src="/dishes/feijoada.png" alt="Feijoada" fill className="object-cover" />
                    </div>
                    <div className="flex flex-col flex-1 py-0.5 pr-1">
                        <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Padrão</p>
                        <h4 className="font-extrabold text-[#0F2A1D] text-[11px] leading-tight mb-1">Feijoada Light</h4>
                        <p className="text-[8px] text-slate-500 leading-[1.3] line-clamp-2">Feijão Preto, Linguiça, Farinha e Salada.</p>
                        <div className="flex justify-end mt-auto pt-1">
                            <div className="w-6 h-6 rounded-lg border border-slate-200 flex items-center justify-center bg-slate-50">
                                <span className="text-[10px] text-slate-400">+</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fade overlay */}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />
            </div>

            <PhoneBottomNav active="cardapio" />
        </div>
    )
}

function PhoneScreenCheckIn({ onAction }: { onAction: () => void }) {
    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <div className="px-5 pt-10 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0F2A1D] flex items-center justify-center">
                        <ChefHat className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] text-[#527252] font-semibold">Reserva para hoje</p>
                        <p className="font-extrabold text-[#0F2A1D] text-base leading-tight">Anderson</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-5 pt-5 relative">
                <div className="bg-white rounded-3xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-slate-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200/60 text-amber-600 text-[9px] font-bold uppercase tracking-wider">
                            <Clock className="w-3 h-3 text-amber-500" /> Pendente
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">Quinta, 26</span>
                    </div>

                    <div className="flex gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-amber-100 overflow-hidden shrink-0 relative">
                            <Image src="/dishes/strogonoff_frango.png" alt="Strogonoff" fill className="object-cover" />
                        </div>
                        <div className="flex flex-col justify-center">
                            <h4 className="font-extrabold text-[#0F2A1D] text-lg leading-tight mb-1">Strogonoff</h4>
                            <p className="text-xs text-slate-500 font-medium tracking-tight">Prato Padrão</p>
                        </div>
                    </div>

                    <button
                        onClick={onAction}
                        className="relative w-full bg-emerald-600 text-white font-bold text-sm h-12 rounded-xl shadow-[0_8px_20px_rgba(5,150,105,0.25)] hover:bg-emerald-700 transition-colors cursor-pointer select-none"
                    >
                        <span className="absolute -inset-1 rounded-2xl animate-pulse bg-emerald-600/20 pointer-events-none" />
                        <span className="relative z-10">Confirmar Presença Hoje</span>
                    </button>
                    <button className="w-full mt-2 text-xs font-semibold text-slate-400 hover:text-slate-600 h-8">
                        Cancelar Reserva
                    </button>
                </div>
            </div>

            <PhoneBottomNav active="pedidos" />
        </div>
    )
}

function PhoneScreenQRCode() {
    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="px-5 pt-10 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0F2A1D] flex items-center justify-center">
                        <ChefHat className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] text-[#527252] font-semibold">Pedido confirmado!</p>
                        <p className="font-extrabold text-[#0F2A1D] text-base leading-tight">Anderson</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
                {/* Success check */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.3 }}
                    className="w-16 h-16 rounded-full bg-[#0F2A1D] flex items-center justify-center shadow-xl shadow-[#0F2A1D]/30"
                >
                    <CheckCircle2 className="w-9 h-9 text-white" />
                </motion.div>

                <div className="text-center space-y-1">
                    <h3 className="font-extrabold text-[#0F2A1D] text-base">Reserva Confirmada!</h3>
                    <p className="text-[10px] text-slate-500">Strogonoff de Frango • Quinta, 26</p>
                </div>

                {/* QR Code */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="bg-white border-2 border-[#0F2A1D]/10 rounded-3xl p-5 shadow-xl shadow-[#0F2A1D]/5"
                >
                    <div className="w-36 h-36 bg-white flex items-center justify-center relative">
                        {/* Fake QR Pattern */}
                        <div className="absolute inset-0 grid grid-cols-9 grid-rows-9 gap-[2px] p-1">
                            {Array.from({ length: 81 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`rounded-sm ${
                                        // Create a QR-like pattern
                                        (i < 3 || (i >= 6 && i < 9) || i % 9 < 3 || i % 9 >= 6 ||
                                            (i >= 18 && i < 21) || (i >= 24 && i < 27) ||
                                            (i >= 54 && i < 57) || (i >= 60 && i < 63) ||
                                            (i >= 72 && i < 75) || (i >= 78 && i < 81) ||
                                            Math.random() > 0.55)
                                            ? 'bg-[#0F2A1D]'
                                            : 'bg-transparent'
                                        }`}
                                />
                            ))}
                        </div>
                        {/* Center logo */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-slate-100">
                                <ChefHat className="w-4 h-4 text-[#0F2A1D]" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-[10px] text-slate-400 font-medium text-center max-w-[180px]"
                >
                    Apresente este QR Code na retirada amanhã
                </motion.p>
            </div>

            <PhoneBottomNav active="pedidos" />
        </div>
    )
}

function PhoneBottomNav({ active }: { active: string }) {
    return (
        <div className="h-16 bg-white border-t border-slate-100 shrink-0 flex items-center justify-around px-2 pb-4 pt-2">
            <div className={`flex flex-col items-center gap-1 ${active === 'cardapio' ? 'text-[#0F2A1D]' : 'text-slate-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${active === 'cardapio' ? 'bg-[#0F2A1D]' : ''}`}>
                    <Utensils className={`w-3.5 h-3.5 ${active === 'cardapio' ? 'text-white' : ''}`} />
                </div>
                <span className="text-[8px] font-bold">Cardápio</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-slate-400">
                <Star className="w-4 h-4" />
                <span className="text-[8px] font-semibold">Feedback</span>
            </div>
            <div className={`flex flex-col items-center gap-1 ${active === 'pedidos' ? 'text-[#0F2A1D]' : 'text-slate-400'}`}>
                <QrCode className={`w-4 h-4 ${active === 'pedidos' ? 'text-[#0F2A1D]' : ''}`} />
                <span className="text-[8px] font-semibold">Pedidos</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-slate-400">
                <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                <span className="text-[8px] font-semibold">Perfil</span>
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────
   Kitchen Terminal Section
   ───────────────────────────────────────────── */
function KitchenTerminal() {
    return (
        <section className="py-28 relative overflow-hidden" style={{ background: '#0F2A1D' }}>
            {/* Ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1a5d1d]/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    {/* Text */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="lg:w-1/2 space-y-6"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-white/80 text-sm font-bold uppercase tracking-wider backdrop-blur-sm">
                            <Scan className="w-4 h-4" /> Na Cozinha
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                            Validação em <span className="text-[#f8b4a0]">milissegundos.</span><br />Zero filas.
                        </h2>
                        <p className="text-lg text-white/70 font-medium leading-relaxed">
                            O tablet da cozinha recebe automaticamente todos os pedidos.<br />Na hora da retirada, a equipe apenas escaneia o QR Code do funcionário e o pedido é validado{'\u00A0'}instantaneamente.
                            <br /><br />
                            Sem buscar nomes. Sem folhear papéis. Sem incerteza.
                        </p>

                        <div className="flex gap-4 pt-4">
                            <div className="bg-white/10 rounded-xl px-5 py-4 border border-white/10 backdrop-blur-sm">
                                <div className="text-2xl font-black text-white">&lt;1s</div>
                                <div className="text-[10px] text-white/50 font-semibold uppercase tracking-wider mt-1">Tempo de validação</div>
                            </div>
                            <div className="bg-white/10 rounded-xl px-5 py-4 border border-white/10 backdrop-blur-sm">
                                <div className="text-2xl font-black text-[#f8b4a0]">0</div>
                                <div className="text-[10px] text-white/50 font-semibold uppercase tracking-wider mt-1">Filas na retirada</div>
                            </div>
                            <div className="bg-white/10 rounded-xl px-5 py-4 border border-white/10 backdrop-blur-sm">
                                <div className="text-2xl font-black text-white">100%</div>
                                <div className="text-[10px] text-white/50 font-semibold uppercase tracking-wider mt-1">Rastreabilidade</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Tablet Mockup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="lg:w-1/2 flex justify-center"
                    >
                        <div className="relative w-full max-w-[500px] aspect-[4/3] rounded-3xl border-[6px] border-slate-800 bg-[#1a1a2e] overflow-hidden shadow-2xl shadow-black/40">
                            {/* Tablet header */}
                            <div className="h-10 bg-[#111827] flex items-center justify-between px-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded bg-[#0F2A1D] flex items-center justify-center">
                                        <ChefHat className="w-2.5 h-2.5 text-white" />
                                    </div>
                                    <span className="text-[10px] text-white/80 font-bold">KitchenOS • Terminal</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                                    </span>
                                    <span className="text-[9px] text-green-400 font-bold">ONLINE</span>
                                </div>
                            </div>

                            {/* Tablet content */}
                            <div className="p-6 flex flex-col items-center justify-center h-[calc(100%-40px)] bg-gradient-to-br from-[#111827] to-[#1f2937] gap-5">
                                {/* Scanning animation */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.5 }}
                                    className="relative"
                                >
                                    <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-green-500/40 flex items-center justify-center">
                                        <Scan className="w-12 h-12 text-green-400/60" />
                                    </div>
                                    {/* Scan line */}
                                    <motion.div
                                        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent"
                                        animate={{ top: ['10%', '90%', '10%'] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                    />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 1 }}
                                    className="text-center space-y-3"
                                >
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold">
                                        <CheckCircle2 className="w-4 h-4" /> Pedido #1247 Validado
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm">Anderson Silva</p>
                                        <p className="text-white/50 text-xs">Strogonoff de Frango • Padrão</p>
                                    </div>
                                </motion.div>

                                {/* Recent validations */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 1.5 }}
                                    className="w-full max-w-[300px] space-y-2 mt-2"
                                >
                                    <div className="text-[9px] text-white/30 font-bold uppercase tracking-wider">Últimas validações</div>
                                    {[
                                        { name: 'Maria Santos', prato: 'Feijoada Light', time: '2s atrás' },
                                        { name: 'João Oliveira', prato: 'Frango Grelhado Fit', time: '15s atrás' },
                                    ].map((v, i) => (
                                        <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                                            <div>
                                                <p className="text-white/80 text-[10px] font-semibold">{v.name}</p>
                                                <p className="text-white/40 text-[8px]">{v.prato}</p>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <CheckCircle2 className="w-3 h-3 text-green-400" />
                                                <span className="text-[8px] text-green-400/80 font-medium">{v.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────────
   Storytelling Quote Section
   ───────────────────────────────────────────── */
function StorytellingSection() {
    return (
        <section className="py-28 relative overflow-hidden" style={{ background: COLORS.creme }}>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1a5d1d]/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="container mx-auto px-6 relative z-10 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="text-center space-y-10"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 text-sm font-bold uppercase tracking-wider shadow-sm">
                        <ChefHat className="w-4 h-4 text-[#1a5d1d]" /> A Origem
                    </div>

                    <blockquote className="relative">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-8xl text-[#1a5d1d]/10 font-serif select-none">&ldquo;</div>
                        <p className="text-2xl md:text-3xl font-bold leading-relaxed text-[#3E2723] max-w-3xl mx-auto italic">
                            Este sistema não nasceu numa sala de reunião. Ele nasceu <span className="text-[#1a5d1d] not-italic font-extrabold">ouvindo quem pica, cozinha e serve</span> milhares de refeições por dia. Magnólia, uma colaboradora de muitos anos da NutriSaúde, nos mostrou que o problema nunca foi a falta de tecnologia — era a falta de alguém para ouvir.
                        </p>
                    </blockquote>

                    <div className="flex items-center justify-center gap-3 pt-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0F2A1D] to-[#1a5d1d] flex items-center justify-center text-white font-bold text-sm shadow-lg">AS</div>
                        <div className="text-left">
                            <p className="font-extrabold text-[#0F2A1D] text-sm">Anderson Silva</p>
                            <p className="text-xs text-slate-500 font-medium">Fundador, KitchenOS</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────────
   Main Interactive Demo Component
   ───────────────────────────────────────────── */
export default function InteractiveDemo() {
    const [currentStep, setCurrentStep] = useState(1)
    const sectionRef = useRef<HTMLDivElement>(null)

    const handleAction = () => {
        if (currentStep < 3) {
            setCurrentStep(prev => prev + 1)
        }
    }

    const currentData = stepsData[currentStep - 1]

    return (
        <>
            {/* ── Hero Intro ── */}
            <section className="py-24 relative overflow-hidden" style={{ background: COLORS.creme }}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#1a5d1d]/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="container mx-auto px-6 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="max-w-3xl mx-auto space-y-6"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-[#1a5d1d] text-sm font-bold uppercase tracking-wider shadow-sm">
                            <Smartphone className="w-4 h-4" /> Test Drive Interativo
                        </div>

                        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight" style={{ color: '#0F2A1D' }}>
                            Não imagine.<br />
                            <span style={{ color: COLORS.verde }}>Experiencie.</span>
                        </h2>

                        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
                            Simule a experiência completa de um colaborador em <strong className="text-[#0F2A1D]">3 cliques</strong>. Interaja com o celular ao lado e veja como 1.500 refeições por dia são gerenciadas sem papel.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ── Interactive App Section ── */}
            <section ref={sectionRef} className="py-20 relative overflow-hidden" style={{ background: COLORS.creme }}>
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 max-w-6xl mx-auto">

                        {/* LEFT: Explanatory Text */}
                        <div className="lg:w-1/2 space-y-8">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 30 }}
                                    transition={{ duration: 0.5 }}
                                    className="space-y-6"
                                >
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0F2A1D]/10 text-[#0F2A1D] text-xs font-bold uppercase tracking-wider">
                                        {currentData.badge}
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-[#1a5d1d] uppercase tracking-wider">{currentData.tagline}</p>
                                        <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight" style={{ color: '#0F2A1D' }}>
                                            {currentData.title}
                                        </h3>
                                    </div>

                                    <p className="text-lg text-slate-600 font-medium leading-relaxed">
                                        {currentData.description}
                                    </p>

                                    {/* Highlight CTA text */}
                                    <div className="flex items-center gap-3 bg-white rounded-xl px-5 py-4 border border-[#1a5d1d]/10 shadow-sm">
                                        <div className="w-8 h-8 rounded-full bg-[#1a5d1d] flex items-center justify-center shrink-0 animate-pulse">
                                            <ArrowRight className="w-4 h-4 text-white" />
                                        </div>
                                        <p className="text-sm font-bold text-[#0F2A1D]">{currentData.highlight}</p>
                                    </div>

                                    {/* Stat */}
                                    <div className="bg-white rounded-2xl px-6 py-5 border border-slate-200 shadow-md inline-flex items-center gap-5">
                                        <div className="text-4xl font-black text-[#1a5d1d]">{currentData.stat.value}</div>
                                        <div className="text-sm text-slate-500 font-medium max-w-[140px] leading-tight">{currentData.stat.label}</div>
                                    </div>

                                    {/* Step Progress */}
                                    <div className="flex gap-2 pt-2">
                                        {[1, 2, 3].map(s => (
                                            <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${s <= currentStep ? 'bg-[#1a5d1d] w-12' : 'bg-slate-200 w-6'}`} />
                                        ))}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* RIGHT: Phone Mockup */}
                        <div className="lg:w-1/2 flex justify-center">
                            <div className="relative">
                                {/* Glow behind phone */}
                                <div className="absolute -inset-10 bg-gradient-to-br from-[#1a5d1d]/10 to-[#f8b4a0]/10 rounded-full blur-3xl pointer-events-none" />

                                {/* Phone Shell */}
                                <div className="relative w-[280px] h-[570px] md:w-[300px] md:h-[610px] rounded-[40px] border-[8px] border-[#0F2A1D] bg-white overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.15)] select-none">
                                    {/* Notch */}
                                    <div className="absolute top-0 inset-x-0 h-6 bg-[#0F2A1D] rounded-b-2xl z-20 w-36 mx-auto flex justify-center items-end pb-1">
                                        <div className="w-12 h-1.5 bg-black/30 rounded-full" />
                                    </div>

                                    {/* Screen Content */}
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currentStep}
                                            initial={{ x: 300, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: -300, opacity: 0 }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                            className="absolute inset-0 z-10"
                                        >
                                            {currentStep === 1 && <PhoneScreenCardapio onAction={handleAction} />}
                                            {currentStep === 2 && <PhoneScreenCheckIn onAction={handleAction} />}
                                            {currentStep === 3 && <PhoneScreenQRCode />}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Kitchen Terminal ── */}
            <KitchenTerminal />

            {/* ── Storytelling ── */}
            <StorytellingSection />
        </>
    )
}
