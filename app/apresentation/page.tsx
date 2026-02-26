'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence, Variants } from 'framer-motion'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { ArrowRight, BarChart3, Clock, ChefHat, Smartphone, Zap, ShieldCheck, ChevronRight, TrendingUp, Utensils, Receipt } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// Animate items on scroll
const fadeUpVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
}

export default function PresentationPage() {
    const { scrollY } = useScroll()
    const opacityHero = useTransform(scrollY, [0, 500], [1, 0])
    const yHero = useTransform(scrollY, [0, 500], [0, 150])

    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-brand-50 text-foreground font-sans overflow-x-hidden selection:bg-brand-500/30">

            {/* Navbar Padrão Transparente */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 backdrop-blur-md bg-white/10 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <Logo variant="dark" className="scale-90 md:scale-100" />
                </div>
                <Link href="/">
                    <Button variant="outline" className="bg-white/50 backdrop-blur-sm border-white/50 hover:bg-white/80 font-bold text-brand-900 rounded-full px-6">
                        Acessar Sistema
                    </Button>
                </Link>
            </nav>

            {/* ================= HERO SECTION ================= */}
            <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
                {/* Background Videos with Parallax */}
                <motion.div
                    style={{ opacity: opacityHero, y: yHero }}
                    className="absolute inset-0 w-full h-full z-0"
                >
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover hidden md:block"
                        src="/bg-video.mp4"
                    />
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover md:hidden block"
                        src="/bg-video-mobile.mp4"
                    />
                    <div className="absolute inset-0 bg-brand-900/60 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-50" />
                </motion.div>

                {/* Hero Content */}
                <div className="relative z-10 container mx-auto px-6 text-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="max-w-4xl mx-auto space-y-8"
                    >
                        <motion.div variants={fadeUpVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white text-sm font-semibold tracking-wide uppercase mb-4">
                            <Zap className="w-4 h-4 text-brand-300" />
                            O Futuro da Operação
                        </motion.div>

                        <motion.h1 variants={fadeUpVariants} className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight drop-shadow-lg">
                            Inteligência que <br className="hidden md:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-200 to-white">transforma restaurantes.</span>
                        </motion.h1>

                        <motion.p variants={fadeUpVariants} className="text-lg md:text-2xl text-brand-50/90 font-medium max-w-2xl mx-auto drop-shadow-md">
                            KitchenOS é a plataforma definitiva de gestão gastronômica. Reduza custos, elimine filas e tome decisões com dados em tempo real.
                        </motion.p>

                        <motion.div variants={fadeUpVariants} className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/">
                                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-lg hover:shadow-xl hover:shadow-brand-500/30 transition-all">
                                    Testar Plataforma <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ================= OVERVIEW / METRICS ================= */}
            <section className="py-24 relative bg-brand-50 z-10">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {[
                            {
                                icon: Clock,
                                title: "Agilidade na Linha",
                                desc: "Gestão inteligente de fluxos e acesso digital aceleram a distribuição nos refeitórios industriais."
                            },
                            {
                                icon: TrendingUp,
                                title: "Controle de Desperdício",
                                desc: "Acompanhamento preciso de consumo e sobras otimizam a rentabilidade em contratos fixos."
                            },
                            {
                                icon: BarChart3,
                                title: "Visão 360º da Operação",
                                desc: "Métricas de custo por refeição, acessos e feedback de qualidade consolidadas em tempo real."
                            }
                        ].map((metric, i) => (
                            <motion.div key={i} variants={fadeUpVariants} className="bg-white rounded-3xl p-8 food-shadow-card border border-brand-100/50 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
                                <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <metric.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-brand-900 mb-3">{metric.title}</h3>
                                <p className="text-muted-foreground font-medium">{metric.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ================= TIMELINE: O ANTES E O DEPOIS ================= */}
            <section className="py-32 bg-brand-50 relative overflow-hidden">
                {/* Subtle Background Elements */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-200/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-white/50 rounded-full blur-[100px] pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-brand-100 text-brand-800 text-sm font-bold uppercase tracking-wide mb-6 shadow-sm">
                            <Utensils className="w-4 h-4" /> Evolução da Operação
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-brand-900 mb-6 tracking-tight">Adeus papel e caneta. <br /> <span className="text-brand-500">Olá fluxo digital.</span></h2>
                        <p className="text-xl text-muted-foreground font-medium">O processo manual gerava filas e desperdício incalculável de insumos pela falta de previsibilidade. Acompanhe a transformação.</p>
                    </div>

                    <div className="max-w-5xl mx-auto relative px-4 md:px-0">

                        {/* Linha Central Vertical */}
                        <div className="absolute left-8 md:left-1/2 top-4 bottom-4 w-1 bg-brand-200/50 transform md:-translate-x-1/2 rounded-full hidden md:block" />

                        <div className="space-y-24">

                            {/* Step 1: O Pedido */}
                            <div className="relative flex flex-col md:flex-row items-center justify-between group">
                                {/* Marcador Central */}
                                <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-white border-4 border-brand-200 z-10 items-center justify-center shadow-sm group-hover:border-brand-400 transition-all duration-300">
                                    <div className="w-3 h-3 rounded-full bg-brand-400" />
                                </div>

                                {/* O Problema (SEMPRE NA ESQUERDA) */}
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: false, margin: "-100px" }}
                                    className="md:w-[45%] mb-8 md:mb-0 text-left md:text-right pr-0 md:pr-12 opacity-60 hover:opacity-100 transition-opacity duration-300"
                                >
                                    <h4 className="text-sm font-bold text-muted-foreground/60 mb-3 uppercase tracking-wider flex items-center md:justify-end gap-2">
                                        Rotina Manual <span className="w-2 h-2 rounded-full bg-muted-foreground/30 inline-block" />
                                    </h4>
                                    <p className="text-muted-foreground/80 font-medium leading-relaxed">
                                        O funcionário precisava ir presencialmente até a cozinha para consultar o cardápio e <strong className="text-red-400">anotar à caneta no papel</strong> qual prato alternativo desejava para o dia seguinte.
                                    </p>
                                </motion.div>

                                {/* A Solução (SEMPRE NA DIREITA) */}
                                <motion.div
                                    initial={{ opacity: 0, x: 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: false, margin: "-100px" }}
                                    className="md:w-[45%] pl-0 md:pl-12"
                                >
                                    <div className="bg-white rounded-3xl p-8 border border-brand-100 shadow-xl shadow-brand-100/50 relative overflow-hidden group-hover:-translate-y-1 transition-transform duration-300">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-brand-600" />
                                        <h4 className="text-2xl font-bold text-brand-900 mb-4 flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 text-sm flex items-center justify-center font-bold">1</span>
                                            Cardápio na Palma da Mão
                                        </h4>
                                        <p className="text-brand-800 font-medium leading-relaxed">
                                            O colaborador faz um breve cadastro e acessa o App. Ele visualiza dinamicamente o cardápio e seleciona suas alternativas para o dia posterior <strong className="text-brand-600">de qualquer lugar</strong>.
                                        </p>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Step 2: A Produção */}
                            <div className="relative flex flex-col md:flex-row items-center justify-between group">
                                {/* Marcador Central */}
                                <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-white border-4 border-brand-200 z-10 items-center justify-center shadow-sm group-hover:border-brand-500 transition-all duration-300">
                                    <div className="w-3 h-3 rounded-full bg-brand-500" />
                                </div>

                                {/* O Problema (SEMPRE NA ESQUERDA) */}
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: false, margin: "-100px" }}
                                    className="md:w-[45%] mb-8 md:mb-0 text-left md:text-right pr-0 md:pr-12 opacity-60 hover:opacity-100 transition-opacity duration-300"
                                >
                                    <h4 className="text-sm font-bold text-muted-foreground/60 mb-3 uppercase tracking-wider flex items-center md:justify-end gap-2">
                                        Produção às Cegas <span className="w-2 h-2 rounded-full bg-muted-foreground/30 inline-block" />
                                    </h4>
                                    <p className="text-muted-foreground/80 font-medium leading-relaxed">
                                        Basear a produção de milhares de refeições em papeladas rasuradas gerava <strong className="text-red-400">desperdício e impossibilitava o planejamento</strong> exato de compras e insumos.
                                    </p>
                                </motion.div>

                                {/* A Solução (SEMPRE NA DIREITA) */}
                                <motion.div
                                    initial={{ opacity: 0, x: 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: false, margin: "-100px" }}
                                    className="md:w-[45%] pl-0 md:pl-12"
                                >
                                    <div className="bg-white rounded-3xl p-8 border border-brand-100 shadow-xl shadow-brand-100/50 relative overflow-hidden group-hover:-translate-y-1 transition-transform duration-300">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-brand-600" />
                                        <h4 className="text-2xl font-bold text-brand-900 mb-4 flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 text-sm flex items-center justify-center font-bold">2</span>
                                            Integração Instantânea
                                        </h4>
                                        <p className="text-brand-800 font-medium leading-relaxed">
                                            A cozinha recebe os pedidos <strong className="text-brand-600">instantaneamente no Dashboard</strong>. O sistema mapeia os totais precisos para que a equipe de compras saiba exatamente o quanto produzir.
                                        </p>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Step 3: A Validação */}
                            <div className="relative flex flex-col md:flex-row items-center justify-between group">
                                {/* Marcador Central */}
                                <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-brand-500 border-4 border-brand-100 z-10 items-center justify-center shadow-[0_0_20px_rgba(107,144,113,0.4)] group-hover:scale-110 transition-all duration-300">
                                    <div className="w-4 h-4 rounded-full bg-white animate-pulse" />
                                </div>

                                {/* O Problema (SEMPRE NA ESQUERDA) */}
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: false, margin: "-100px" }}
                                    className="md:w-[45%] mb-8 md:mb-0 text-left md:text-right pr-0 md:pr-12 opacity-60 hover:opacity-100 transition-opacity duration-300"
                                >
                                    <h4 className="text-sm font-bold text-muted-foreground/60 mb-3 uppercase tracking-wider flex items-center md:justify-end gap-2">
                                        O Gargalo da Roleta <span className="w-2 h-2 rounded-full bg-muted-foreground/30 inline-block" />
                                    </h4>
                                    <p className="text-muted-foreground/80 font-medium leading-relaxed">
                                        Funcionárias na roleta perdiam tempo precioso folheando papéis para encontrar nomes na hora de servir o almoço, <strong className="text-red-400">causando filas extremas</strong> no pico operacional.
                                    </p>
                                </motion.div>

                                {/* A Solução (SEMPRE NA DIREITA) */}
                                <motion.div
                                    initial={{ opacity: 0, x: 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: false, margin: "-100px" }}
                                    className="md:w-[45%] pl-0 md:pl-12"
                                >
                                    <div className="bg-gradient-to-br from-brand-900 to-brand-800 rounded-3xl p-8 border border-brand-700 shadow-2xl shadow-brand-900/20 transform group-hover:-translate-y-2 transition-transform duration-300 group-hover:shadow-brand-500/30">
                                        <h4 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-full bg-white text-brand-900 text-sm flex items-center justify-center font-bold">3</span>
                                            Catraca Expressa
                                        </h4>
                                        <p className="text-brand-50 font-medium leading-relaxed">
                                            No refeitório o funcionário apenas exibe seu celular e a roleta <strong className="text-brand-300">escaneia o QR Code dele</strong>, aprovando a retirada do prato correto na fração de um segundo. Zero papéis. Zero atritos.
                                        </p>
                                    </div>
                                </motion.div>
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            {/* ================= SHOWCASE: SYSTEM PREVIEWS ================= */}
            <section className="py-24 bg-white relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-100/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-200/20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10 space-y-32">

                    {/* Feature 1: Dashboard CEO */}
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                            className="lg:w-1/2 space-y-6"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-sm font-bold uppercase tracking-wider">
                                <BarChart3 className="w-4 h-4" /> Para a Liderança
                            </div>
                            <h2 className="text-4xl md:text-5xl font-extrabold text-brand-900 tracking-tight">
                                Controle total na <span className="text-brand-500">palma da mão.</span>
                            </h2>
                            <p className="text-xl text-muted-foreground font-medium">
                                Acompanhe o faturamento, produtos mais vendidos, margens de lucro e tempo de atendimento em uma interface desenhada para decisões executivas rápidas.
                            </p>
                            <ul className="space-y-4 pt-4">
                                {['Métricas financeiras atualizadas em tempo real', 'Gráficos interativos e exportação de relatórios', 'Acompanhamento do Ticket Médio e Satisfação (NPS)'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-brand-800 font-semibold">
                                        <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                                            <ChevronRight className="w-4 h-4 text-brand-600" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 50, scale: 0.95 }}
                            whileInView={{ opacity: 1, x: 0, scale: 1 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="lg:w-1/2 w-full"
                        >
                            {/* PLACEHOLDER: Usar o admin-dashbord real aqui depois */}
                            <div className="relative rounded-2xl overflow-hidden food-shadow-elevated border border-brand-100 bg-white aspect-[16/10] flex items-center justify-center group">
                                <div className="absolute inset-0 bg-brand-50/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <p className="font-bold text-brand-900 text-lg">Espaço Reservado: Print do Dashboard</p>
                                    <p className="text-brand-700 text-sm">/public/screenshots/admin-dashboard.jpg</p>
                                </div>
                                {/* Mockup UI de fundo para não ficar vazio */}
                                <div className="w-full h-full p-4 flex flex-col gap-4 opacity-50">
                                    <div className="w-full h-12 bg-gray-100 rounded-lg animate-pulse" />
                                    <div className="flex gap-4">
                                        <div className="w-1/3 h-24 bg-gray-100 rounded-xl animate-pulse" />
                                        <div className="w-1/3 h-24 bg-gray-100 rounded-xl animate-pulse" />
                                        <div className="w-1/3 h-24 bg-gray-100 rounded-xl animate-pulse" />
                                    </div>
                                    <div className="w-full h-48 bg-gray-100 rounded-xl animate-pulse mt-4" />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Feature 2: Operação (Menu / Pedidos) */}
                    <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                            className="lg:w-1/2 space-y-6"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-sm font-bold uppercase tracking-wider">
                                <Utensils className="w-4 h-4" /> Para a Operação
                            </div>
                            <h2 className="text-4xl md:text-5xl font-extrabold text-brand-900 tracking-tight">
                                Cardápio dinâmico e <span className="text-brand-500">experiência fluida.</span>
                            </h2>
                            <p className="text-xl text-muted-foreground font-medium">
                                Cardápio digital com design premium, gerador de fotos por Inteligência Artificial (Gemini), leitura de QR Code na mesa e autoatendimento completo.
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: -50, scale: 0.95 }}
                            whileInView={{ opacity: 1, x: 0, scale: 1 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="lg:w-1/2 w-full flex justify-center"
                        >
                            {/* Mobile Mockup Holder */}
                            <div className="relative w-[300px] h-[600px] rounded-[40px] border-[8px] border-brand-900 bg-white overflow-hidden food-shadow-elevated group flex items-center justify-center">
                                <div className="absolute top-0 inset-x-0 h-6 bg-brand-900 rounded-b-xl z-20 w-40 mx-auto" /> {/* Notch */}

                                <div className="absolute inset-0 bg-brand-50/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <p className="font-bold text-brand-900 text-lg mb-2">Espaço Reservado: Print do Cardápio</p>
                                    <p className="text-brand-700 text-sm font-mono">/screenshots/menu-mobile.jpg</p>
                                </div>

                                {/* Mockup UI de Menu */}
                                <div className="w-full h-full p-4 pt-10 flex flex-col gap-4 bg-brand-50 opacity-50">
                                    <div className="w-24 h-6 bg-brand-200 rounded-full mb-4 animate-pulse" />
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-full h-32 bg-white rounded-2xl flex p-3 gap-3 shadow-sm">
                                            <div className="w-24 h-full bg-brand-100 rounded-xl animate-pulse" />
                                            <div className="flex-1 space-y-2 py-1">
                                                <div className="w-full h-4 bg-brand-100 rounded-full animate-pulse" />
                                                <div className="w-2/3 h-3 bg-brand-50 rounded-full animate-pulse" />
                                                <div className="w-16 h-5 bg-brand-500/20 rounded-md animate-pulse mt-auto" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </section>

            {/* ================= TECHNOLOGY & BENEFITS ================= */}
            <section className="py-24 bg-brand-900 text-brand-50 relative">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">Pronto para escalar. Construído com tecnologia de ponta.</h2>
                        <p className="text-lg text-brand-200">Não é apenas um site bonitinho. É um sistema Real-Time, suportado pelas mesmas tecnologias usadas por big techs.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Zap, title: "Next.js & React", desc: "Perfomance absurda e renderização instantânea." },
                            { icon: ShieldCheck, title: "Supabase", desc: "Banco de dados em tempo real e autenticação segura." },
                            { icon: Smartphone, title: "Mobile-First", desc: "Experiência perfeita em tablets (cozinha) e celulares (cliente)." },
                            { icon: ChefHat, title: "Integração IA", desc: "Geração de imagens e insights usando modelos avançados." }
                        ].map((tech, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-brand-800/50 border border-brand-700 p-6 rounded-2xl backdrop-blur-md"
                            >
                                <tech.icon className="w-8 h-8 text-brand-300 mb-4" />
                                <h4 className="text-xl font-bold text-white mb-2">{tech.title}</h4>
                                <p className="text-sm text-brand-200/80">{tech.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= CTA FINAL ================= */}
            <section className="py-24 bg-white text-center">
                <div className="container mx-auto px-6 max-w-4xl space-y-8">
                    <h2 className="text-4xl md:text-6xl font-extrabold text-brand-900 tracking-tight">O próximo nível do seu negócio.</h2>
                    <p className="text-xl text-muted-foreground">Experimente o sistema por dentro e entenda como podemos transformar a operação de ponta a ponta hoje mesmo.</p>
                    <br />
                    <Link href="/">
                        <Button size="lg" className="h-16 px-12 text-xl font-bold bg-brand-900 hover:bg-brand-800 text-white rounded-full shadow-2xl hover:shadow-brand-900/40 transition-all hover:scale-105">
                            Abrir Plataforma KitchenOS
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-brand-100 bg-brand-50 text-center text-brand-800/60 font-medium text-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Logo variant="dark" className="scale-75 opacity-50 grayscale" />
                </div>
                © 2026 KitchenOS. Apresentação Executiva.
            </footer>
        </div>
    )
}
