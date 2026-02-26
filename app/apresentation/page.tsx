'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence, Variants } from 'framer-motion'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { ArrowRight, BarChart3, Clock, ChefHat, Smartphone, Zap, ShieldCheck, ChevronRight, TrendingUp, Utensils, Receipt, DollarSign, CheckCircle2, TrendingDown, LogOut, Award, Plus, Menu, X, QrCode, Scan, Users } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import InteractiveDemo from '@/components/presentation/InteractiveDemo'

// Animations
const fadeUp: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
}

const stagger: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
}

// Navigation links
const NAV_LINKS = [
    { label: 'Visão Geral', href: '#visao-geral' },
    { label: 'Processo', href: '#processo' },
    { label: 'Experiência', href: '#experiencia' },
    { label: 'Sistema', href: '#sistema' },
    { label: 'Tecnologia', href: '#tecnologia' },
]

export default function PresentationPage() {
    const { scrollY } = useScroll()
    const opacityHero = useTransform(scrollY, [0, 500], [1, 0])
    const yHero = useTransform(scrollY, [0, 500], [0, 100])

    const [mounted, setMounted] = useState(false)
    const [mobileMenu, setMobileMenu] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden selection:bg-brand-500/20" style={{ scrollBehavior: 'smooth' }}>

            {/* ═══════════ NAVBAR ═══════════ */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 py-3 transition-all duration-300 backdrop-blur-xl bg-white/70 border-b border-slate-100/80">
                <div className="flex items-center gap-2">
                    <Logo variant="dark" className="scale-90 md:scale-100" />
                </div>

                {/* Desktop Nav Links */}
                <div className="hidden lg:flex items-center gap-1">
                    {NAV_LINKS.map(link => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="px-4 py-2 text-[13px] font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            {link.label}
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/">
                        <Button className="hidden sm:inline-flex bg-[#0F2A1D] hover:bg-[#163B29] text-white text-[13px] font-semibold rounded-full px-6 py-2.5 h-auto shadow-lg shadow-[#0F2A1D]/20 transition-all hover:shadow-xl">
                            Acessar Sistema <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                        </Button>
                    </Link>

                    {/* Mobile burger */}
                    <button onClick={() => setMobileMenu(!mobileMenu)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors">
                        {mobileMenu ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenu && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 bg-white border-b border-slate-100 py-4 px-6 lg:hidden shadow-xl"
                        >
                            {NAV_LINKS.map(link => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenu(false)}
                                    className="block py-3 text-sm font-semibold text-slate-700 hover:text-slate-900 border-b border-slate-50 last:border-0"
                                >
                                    {link.label}
                                </a>
                            ))}
                            <Link href="/" className="block mt-4">
                                <Button className="w-full bg-[#0F2A1D] hover:bg-[#163B29] text-white text-[13px] font-semibold rounded-full px-6 py-3 h-auto">
                                    Acessar Sistema <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                                </Button>
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>


            {/* ═══════════ HERO ═══════════ */}
            <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
                <motion.div
                    style={{ opacity: opacityHero, y: yHero }}
                    className="absolute inset-0 w-full h-full z-0"
                >
                    <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover hidden md:block" src="/bg-video.mp4" />
                    <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover md:hidden block" src="/bg-video-mobile.mp4" />
                    <div className="absolute inset-0 bg-[#0F2A1D]/70" />
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white" />
                </motion.div>

                <div className="relative z-10 container mx-auto px-6 text-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={stagger}
                        className="max-w-4xl mx-auto space-y-7"
                    >
                        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-white text-[13px] font-semibold tracking-wide uppercase">
                            <Zap className="w-3.5 h-3.5 text-emerald-300" />
                            Gestão Gastronômica Inteligente
                        </motion.div>

                        <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.1]">
                            Tecnologia que{' '}
                            <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-white">transforma operações.</span>
                        </motion.h1>

                        <motion.p variants={fadeUp} className="text-base sm:text-lg md:text-xl text-white/80 font-normal max-w-2xl mx-auto leading-relaxed">
                            KitchenOS é a plataforma que digitaliza o fluxo de pedidos, elimina filas e entrega controle total ao gestor em tempo real.
                        </motion.p>

                        <motion.div variants={fadeUp} className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/">
                                <Button className="h-12 px-8 text-[14px] font-semibold bg-white text-[#0F2A1D] hover:bg-slate-100 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]">
                                    Testar Plataforma <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </Link>
                            <a href="#experiencia">
                                <Button variant="outline" className="h-12 px-8 text-[14px] font-semibold bg-transparent text-white border-white/25 hover:bg-white/10 rounded-full transition-all">
                                    Ver Demonstração
                                </Button>
                            </a>
                        </motion.div>
                    </motion.div>
                </div>
            </section>


            {/* ═══════════ VISÃO GERAL / METRICS ═══════════ */}
            <section id="visao-geral" className="py-24 relative bg-white z-10">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-80px' }}
                        variants={stagger}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {[
                            {
                                icon: Clock,
                                title: 'Agilidade na Operação',
                                desc: 'Fluxos digitais aceleram o atendimento e eliminam etapas manuais nos refeitórios.'
                            },
                            {
                                icon: TrendingUp,
                                title: 'Controle de Desperdício',
                                desc: 'Previsibilidade de consumo reduz a sobreprovisão e otimiza os insumos comprados.'
                            },
                            {
                                icon: BarChart3,
                                title: 'Visão 360° em Tempo Real',
                                desc: 'Métricas de custo, satisfação e volume consolidadas em dashboards executivos.'
                            }
                        ].map((metric, i) => (
                            <motion.div key={i} variants={fadeUp} className="bg-slate-50 rounded-2xl p-8 border border-slate-100 flex flex-col items-center text-center group hover:-translate-y-1 transition-transform duration-300">
                                <div className="w-14 h-14 rounded-xl bg-[#0F2A1D] text-white flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-[#0F2A1D]/20">
                                    <metric.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{metric.title}</h3>
                                <p className="text-slate-500 font-normal text-sm leading-relaxed">{metric.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>


            {/* ═══════════ TIMELINE: O ANTES E O DEPOIS ═══════════ */}
            <section id="processo" className="py-28 bg-[#0F2A1D] relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-400/5 rounded-full blur-[80px] pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-white/80 text-[13px] font-semibold uppercase tracking-wider mb-6">
                            <Utensils className="w-3.5 h-3.5" /> Evolução da Operação
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-5 tracking-tight">
                            Adeus papel e caneta.<br />
                            <span className="text-emerald-400">Olá fluxo digital.</span>
                        </h2>
                        <p className="text-lg text-white/60 font-normal leading-relaxed">
                            O processo manual gerava filas e desperdício. Acompanhe a transformação.
                        </p>
                    </div>

                    <div className="max-w-5xl mx-auto relative px-4 md:px-0">
                        {/* Vertical line */}
                        <div className="absolute left-8 md:left-1/2 top-4 bottom-4 w-px bg-white/10 transform md:-translate-x-1/2 hidden md:block" />

                        <div className="space-y-20">

                            {/* Step 1 */}
                            <div className="relative flex flex-col md:flex-row items-center justify-between group">
                                <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-white/10 border-2 border-emerald-500/40 z-10 items-center justify-center backdrop-blur-sm">
                                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: false, margin: '-100px' }}
                                    className="md:w-[45%] mb-6 md:mb-0 text-left md:text-right pr-0 md:pr-12"
                                >
                                    <h4 className="text-[12px] font-semibold text-red-400/80 mb-3 uppercase tracking-wider flex items-center md:justify-end gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-400/60 inline-block" /> Rotina Manual
                                    </h4>
                                    <p className="text-white/40 font-normal leading-relaxed text-sm">
                                        O funcionário precisava ir até a cozinha para consultar o cardápio e <strong className="text-red-400/80">anotar à caneta no papel</strong> qual prato alternativo desejava para o dia seguinte.
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: false, margin: '-100px' }}
                                    className="md:w-[45%] pl-0 md:pl-12"
                                >
                                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-7 border border-white/10 relative overflow-hidden group-hover:-translate-y-1 transition-transform duration-300">
                                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-emerald-500/50 to-transparent" />
                                        <h4 className="text-xl font-bold text-white mb-3 flex items-center gap-3">
                                            <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold">1</span>
                                            Cardápio na Palma da Mão
                                        </h4>
                                        <p className="text-white/60 font-normal leading-relaxed text-sm">
                                            O colaborador faz um breve cadastro e acessa o App. Ele visualiza o cardápio e seleciona suas alternativas <strong className="text-emerald-400">de qualquer lugar</strong>.
                                        </p>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Step 2 */}
                            <div className="relative flex flex-col md:flex-row items-center justify-between group">
                                <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-white/10 border-2 border-emerald-500/40 z-10 items-center justify-center backdrop-blur-sm">
                                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: false, margin: '-100px' }}
                                    className="md:w-[45%] mb-6 md:mb-0 text-left md:text-right pr-0 md:pr-12"
                                >
                                    <h4 className="text-[12px] font-semibold text-red-400/80 mb-3 uppercase tracking-wider flex items-center md:justify-end gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-400/60 inline-block" /> Produção às Cegas
                                    </h4>
                                    <p className="text-white/40 font-normal leading-relaxed text-sm">
                                        Basear a produção de milhares de refeições em papeladas rasuradas gerava <strong className="text-red-400/80">desperdício e impossibilitava o planejamento</strong> exato de compras e insumos.
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: false, margin: '-100px' }}
                                    className="md:w-[45%] pl-0 md:pl-12"
                                >
                                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-7 border border-white/10 relative overflow-hidden group-hover:-translate-y-1 transition-transform duration-300">
                                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-emerald-500/50 to-transparent" />
                                        <h4 className="text-xl font-bold text-white mb-3 flex items-center gap-3">
                                            <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold">2</span>
                                            Integração Instantânea
                                        </h4>
                                        <p className="text-white/60 font-normal leading-relaxed text-sm">
                                            A cozinha recebe os pedidos <strong className="text-emerald-400">instantaneamente no Dashboard</strong>. O sistema mapeia os totais para que a equipe saiba exatamente o quanto produzir.
                                        </p>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Step 3 */}
                            <div className="relative flex flex-col md:flex-row items-center justify-between group">
                                <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-400 z-10 items-center justify-center backdrop-blur-sm shadow-[0_0_20px_rgba(52,211,153,0.2)]">
                                    <div className="w-4 h-4 rounded-full bg-emerald-400 animate-pulse" />
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: false, margin: '-100px' }}
                                    className="md:w-[45%] mb-6 md:mb-0 text-left md:text-right pr-0 md:pr-12"
                                >
                                    <h4 className="text-[12px] font-semibold text-red-400/80 mb-3 uppercase tracking-wider flex items-center md:justify-end gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-400/60 inline-block" /> O Gargalo da Roleta
                                    </h4>
                                    <p className="text-white/40 font-normal leading-relaxed text-sm">
                                        Funcionárias perdiam tempo folheando papéis para encontrar nomes na hora de servir, <strong className="text-red-400/80">causando filas extremas</strong> no pico operacional.
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: false, margin: '-100px' }}
                                    className="md:w-[45%] pl-0 md:pl-12"
                                >
                                    <div className="bg-gradient-to-br from-emerald-500/10 to-white/5 backdrop-blur-sm rounded-2xl p-7 border border-emerald-500/20 relative overflow-hidden group-hover:-translate-y-1 transition-transform duration-300 shadow-[0_0_30px_rgba(52,211,153,0.06)]">
                                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-emerald-400 to-transparent" />
                                        <h4 className="text-xl font-bold text-white mb-3 flex items-center gap-3">
                                            <span className="w-7 h-7 rounded-lg bg-emerald-500/30 text-emerald-300 text-xs flex items-center justify-center font-bold">3</span>
                                            Catraca Expressa
                                        </h4>
                                        <p className="text-white/60 font-normal leading-relaxed text-sm">
                                            O funcionário exibe seu QR Code e a cozinha <strong className="text-emerald-400">escaneia e valida em milissegundos</strong>. Zero papéis. Zero atritos.
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* ═══════════ INTERACTIVE PRODUCT-LED DEMO ═══════════ */}
            <div id="experiencia">
                <InteractiveDemo />
            </div>


            {/* ═══════════ SHOWCASE: 4 SYSTEM PREVIEWS ═══════════ */}
            <section id="sistema" className="py-24 bg-slate-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#0F2A1D]/3 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10 space-y-28">

                    {/* ── 1. CEO Dashboard ── */}
                    <div className="flex flex-col lg:flex-row items-center gap-14">
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 0.5 }}
                            className="lg:w-[45%] space-y-5"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0F2A1D] text-white text-[11px] font-semibold uppercase tracking-wider">
                                <BarChart3 className="w-3.5 h-3.5" /> Visão do CEO
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                                Controle total na <span className="text-[#0F2A1D]">palma da mão.</span>
                            </h2>
                            <p className="text-base text-slate-500 font-normal leading-relaxed">
                                Faturamento, produtos mais vendidos, margens e satisfação em uma interface desenhada para decisões rápidas.
                            </p>
                            <ul className="space-y-3 pt-2">
                                {['Métricas financeiras em tempo real', 'Gráficos interativos e exportação de relatórios', 'Ticket Médio e Satisfação (NPS)'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-700 font-medium text-sm">
                                        <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 40, scale: 0.97 }}
                            whileInView={{ opacity: 1, x: 0, scale: 1 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="lg:w-[55%] w-full"
                        >
                            {/* CEO Dashboard Mockup */}
                            <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl shadow-[#0F2A1D]/10 border border-slate-200 bg-white aspect-[16/10]">
                                {/* Browser bar */}
                                <div className="h-10 bg-slate-50 border-b border-slate-100 flex items-center justify-between px-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                                        </div>
                                        <div className="ml-3 flex items-center gap-1.5">
                                            <div className="w-5 h-5 rounded bg-[#0F2A1D] flex items-center justify-center">
                                                <ChefHat className="w-2.5 h-2.5 text-white" />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-700">Cockpit Executivo</span>
                                            <span className="flex items-center gap-1 text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                LIVE
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Dashboard Body */}
                                <div className="p-5 flex flex-col gap-4">
                                    {/* KPI Row */}
                                    <div className="flex gap-3">
                                        {[
                                            { label: 'CMV Projetado', value: 'R$ 11.85', sub: '-R$ 1.15 vs Meta', icon: DollarSign, accent: 'text-emerald-600' },
                                            { label: 'Refeições Serv.', value: '1,452', sub: 'Confirmadas', icon: Utensils, accent: 'text-emerald-600' },
                                            { label: 'Taxa Rejeição', value: '0.8%', sub: 'Queda drástica', icon: TrendingDown, accent: 'text-red-500' },
                                        ].map((kpi, i) => (
                                            <div key={i} className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col justify-between min-h-[80px]">
                                                <div className="flex justify-between items-start">
                                                    <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</div>
                                                    <div className="w-5 h-5 rounded bg-[#0F2A1D] flex items-center justify-center">
                                                        <kpi.icon className="w-2.5 h-2.5 text-white" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-lg font-bold text-slate-900 leading-none">{kpi.value}</div>
                                                    <div className={`text-[9px] mt-1 font-semibold ${kpi.accent}`}>{kpi.sub}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Chart */}
                                    <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-4 relative overflow-hidden">
                                        <div className="text-[10px] font-bold text-slate-700 mb-1 flex items-center gap-2">
                                            <div className="w-4 h-4 rounded bg-[#0F2A1D] flex items-center justify-center">
                                                <TrendingUp className="w-2.5 h-2.5 text-white" />
                                            </div>
                                            Evolução Custo vs Qualidade
                                        </div>
                                        <div className="text-[9px] text-slate-400 font-medium mb-4">Últimos 30 dias</div>
                                        <div className="h-28 flex items-end justify-between gap-1 px-1">
                                            {[30, 45, 35, 55, 48, 65, 55, 75, 68, 85, 80, 95].map((h, i) => (
                                                <motion.div
                                                    key={i}
                                                    className="flex-1 bg-gradient-to-t from-emerald-500/30 to-emerald-500/5 rounded-t-sm"
                                                    initial={{ height: 0 }}
                                                    whileInView={{ height: `${h}%` }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: i * 0.04, duration: 0.4 }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>


                    {/* ── 2. Manager Dashboard ── */}
                    <div className="flex flex-col lg:flex-row-reverse items-center gap-14">
                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 0.5 }}
                            className="lg:w-[45%] space-y-5"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0F2A1D] text-white text-[11px] font-semibold uppercase tracking-wider">
                                <Users className="w-3.5 h-3.5" /> Visão do Gerente
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                                Gestão do dia a dia <span className="text-[#0F2A1D]">sem complicação.</span>
                            </h2>
                            <p className="text-base text-slate-500 font-normal leading-relaxed">
                                Dashboard operacional com pedidos do dia, cardápio dinâmico, feed de atividades e controle total do fluxo.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -40, scale: 0.97 }}
                            whileInView={{ opacity: 1, x: 0, scale: 1 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="lg:w-[55%] w-full"
                        >
                            {/* Manager Dashboard Mockup */}
                            <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl shadow-[#0F2A1D]/10 border border-slate-200 bg-white aspect-[16/10]">
                                <div className="h-10 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                                    </div>
                                    <div className="ml-3 flex items-center gap-1.5">
                                        <div className="w-5 h-5 rounded bg-[#0F2A1D] flex items-center justify-center">
                                            <ChefHat className="w-2.5 h-2.5 text-white" />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-700">Painel Operacional</span>
                                    </div>
                                </div>

                                <div className="p-5 flex gap-4">
                                    {/* Sidebar mini */}
                                    <div className="w-12 bg-[#0F2A1D] rounded-xl flex flex-col items-center py-4 gap-4 shrink-0 hidden sm:flex">
                                        <ChefHat className="w-4 h-4 text-white/80" />
                                        <div className="w-6 h-px bg-white/10" />
                                        <Utensils className="w-3.5 h-3.5 text-white/40" />
                                        <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                                        <Receipt className="w-3.5 h-3.5 text-white/40" />
                                        <BarChart3 className="w-3.5 h-3.5 text-white/40" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 space-y-3">
                                        <div className="flex gap-3">
                                            <div className="flex-1 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                                                <div className="text-[8px] font-bold text-emerald-700 uppercase">Pedidos Hoje</div>
                                                <div className="text-xl font-bold text-slate-900 mt-1">247</div>
                                            </div>
                                            <div className="flex-1 bg-amber-50 border border-amber-100 rounded-xl p-3">
                                                <div className="text-[8px] font-bold text-amber-700 uppercase">Pendentes</div>
                                                <div className="text-xl font-bold text-slate-900 mt-1">12</div>
                                            </div>
                                            <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-3 hidden sm:block">
                                                <div className="text-[8px] font-bold text-slate-500 uppercase">Escaneados</div>
                                                <div className="text-xl font-bold text-slate-900 mt-1">235</div>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                            <div className="text-[9px] font-bold text-slate-700 mb-2">Feed de Atividades</div>
                                            {['João validou pedido #1247', 'Maria confirmou Strogonoff', 'Carlos escaneou QR Code'].map((item, i) => (
                                                <div key={i} className="flex items-center gap-2 py-1.5 border-b border-slate-50 last:border-0">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                                                    <span className="text-[9px] text-slate-600">{item}</span>
                                                    <span className="text-[8px] text-slate-400 ml-auto">{i + 1}min</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>


                    {/* ── 3. Employee Mobile App ── */}
                    <div className="flex flex-col lg:flex-row items-center gap-14">
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 0.5 }}
                            className="lg:w-1/2 space-y-5"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0F2A1D] text-white text-[11px] font-semibold uppercase tracking-wider">
                                <Smartphone className="w-3.5 h-3.5" /> App do Funcionário
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                                Cardápio dinâmico e <span className="text-[#0F2A1D]">experiência fluida.</span>
                            </h2>
                            <p className="text-base text-slate-500 font-normal leading-relaxed">
                                Design premium otimizado para mobile. O colaborador acessa, seleciona e confirma em segundos.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 40, scale: 0.97 }}
                            whileInView={{ opacity: 1, x: 0, scale: 1 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="lg:w-1/2 w-full flex justify-center"
                        >
                            <div className="relative w-[280px] h-[570px] rounded-[40px] border-[8px] border-[#0F2A1D] bg-white overflow-hidden shadow-2xl shadow-[#0F2A1D]/15">
                                <div className="absolute top-0 inset-x-0 h-6 bg-[#0F2A1D] rounded-b-2xl z-20 w-36 mx-auto flex justify-center items-end pb-1">
                                    <div className="w-12 h-1.5 bg-black/30 rounded-full" />
                                </div>
                                <div className="absolute inset-0 z-10 w-full h-full pt-6">
                                    <Image src="/mobile-mockup-v3.png" alt="App do Funcionário" fill className="object-cover rounded-[2rem]" quality={100} priority />
                                </div>
                            </div>
                        </motion.div>
                    </div>


                    {/* ── 4. Kitchen Tablet ── */}
                    <div className="flex flex-col lg:flex-row-reverse items-center gap-14">
                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 0.5 }}
                            className="lg:w-[45%] space-y-5"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0F2A1D] text-white text-[11px] font-semibold uppercase tracking-wider">
                                <Scan className="w-3.5 h-3.5" /> Tablet da Cozinha
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                                Validação por QR Code <span className="text-[#0F2A1D]">em milissegundos.</span>
                            </h2>
                            <p className="text-base text-slate-500 font-normal leading-relaxed">
                                O tablet na cozinha escaneia o QR Code do funcionário e valida instantaneamente. Zero busca por nomes. Zero filas.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -40, scale: 0.97 }}
                            whileInView={{ opacity: 1, x: 0, scale: 1 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="lg:w-[55%] w-full"
                        >
                            {/* Tablet Mockup */}
                            <div className="relative w-full max-w-[550px] mx-auto aspect-[4/3] rounded-3xl border-[6px] border-slate-800 bg-[#111827] overflow-hidden shadow-2xl shadow-black/20">
                                <div className="h-9 bg-[#111827] border-b border-white/5 flex items-center justify-between px-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded bg-[#0F2A1D] flex items-center justify-center">
                                            <ChefHat className="w-2.5 h-2.5 text-white" />
                                        </div>
                                        <span className="text-[10px] text-white/70 font-bold">KitchenOS • Terminal</span>
                                    </div>
                                    <span className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] text-emerald-400 font-bold">ONLINE</span>
                                    </span>
                                </div>

                                <div className="p-6 flex flex-col items-center justify-center h-[calc(100%-36px)] bg-gradient-to-br from-[#111827] to-[#1f2937] gap-4">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-emerald-500/30 flex items-center justify-center">
                                            <Scan className="w-10 h-10 text-emerald-400/50" />
                                        </div>
                                        <motion.div
                                            className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
                                            animate={{ top: ['10%', '90%', '10%'] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                        />
                                    </div>

                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Pedido #1247 Validado
                                    </div>
                                    <div className="text-center">
                                        <p className="text-white font-bold text-sm">Anderson Silva</p>
                                        <p className="text-white/40 text-[10px]">Strogonoff de Frango • Padrão</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </section>


            {/* ═══════════ TECHNOLOGY ═══════════ */}
            <section id="tecnologia" className="py-24 bg-[#0F2A1D] relative">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Construído com tecnologia de ponta.</h2>
                        <p className="text-base text-white/50 font-normal">Não é apenas um site. É um sistema real-time, suportado pelas mesmas tecnologias usadas por big techs.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[
                            { icon: Zap, title: 'Next.js & React', desc: 'Performance absurda e renderização instantânea.' },
                            { icon: ShieldCheck, title: 'Supabase', desc: 'Banco de dados real-time e autenticação segura.' },
                            { icon: Smartphone, title: 'Mobile-First', desc: 'Experiência perfeita em celulares e tablets.' },
                            { icon: ChefHat, title: 'Integração IA', desc: 'Geração de imagens e insights via modelos avançados.' }
                        ].map((tech, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-colors"
                            >
                                <tech.icon className="w-7 h-7 text-emerald-400 mb-4" />
                                <h4 className="text-lg font-bold text-white mb-2">{tech.title}</h4>
                                <p className="text-sm text-white/50 font-normal">{tech.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>


            {/* ═══════════ CTA FINAL ═══════════ */}
            <section className="py-24 bg-white text-center">
                <div className="container mx-auto px-6 max-w-3xl space-y-6">
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">O próximo nível do seu negócio.</h2>
                    <p className="text-lg text-slate-500 font-normal">Experimente o sistema e entenda como transformar a operação de ponta a ponta.</p>
                    <div className="pt-4">
                        <Link href="/">
                            <Button className="h-14 px-10 text-[15px] font-semibold bg-[#0F2A1D] hover:bg-[#163B29] text-white rounded-full shadow-2xl shadow-[#0F2A1D]/20 transition-all hover:scale-[1.02]">
                                Abrir Plataforma KitchenOS <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>


            {/* ═══════════ FOOTER ═══════════ */}
            <footer className="py-8 border-t border-slate-100 bg-white text-center text-slate-400 font-normal text-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Logo variant="dark" className="scale-75 opacity-40 grayscale" />
                </div>
                © 2026 KitchenOS • Apresentação Executiva.
            </footer>
        </div>
    )
}
