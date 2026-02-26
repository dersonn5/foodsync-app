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

            {/* ================= BEFORE VS AFTER OPERATIONS ================= */}
            <section className="py-24 bg-brand-900 relative overflow-hidden text-brand-50">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-800 border border-brand-700 text-brand-200 text-sm font-bold uppercase tracking-wide mb-6">
                            <Utensils className="w-4 h-4" /> A Evolução do Refeitório
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Adeus papel e caneta. <br /> <span className="text-brand-400">Olá fluxo digital.</span></h2>
                        <p className="text-xl text-brand-200/80">O processo manual gerava filas infernais e desperdício de produção incalculável pela falta de previsibilidade. Veja o que mudou.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">

                        {/* THE BEFORE */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            className="bg-brand-950 rounded-3xl p-8 border border-red-900/30 relative flex flex-col"
                        >
                            <div className="absolute -top-4 -right-4 w-12 h-12 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center border border-red-500/20">
                                <span className="font-bold text-xl">✗</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <span className="text-red-400 text-sm uppercase tracking-wider font-bold">O Problema</span>
                                <br /> O Processo Antigo
                            </h3>

                            <ul className="space-y-6 flex-1">
                                <li className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-brand-900 flex items-center justify-center flex-shrink-0 mt-1 border border-brand-800 text-brand-400 font-mono text-sm leading-none">1</div>
                                    <p className="text-brand-200/90 leading-relaxed">O funcionário caminhava até a cozinha presencialmente para ver o cardápio e os pratos alternativos do dia seguinte.</p>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-brand-900 flex items-center justify-center flex-shrink-0 mt-1 border border-brand-800 text-brand-400 font-mono text-sm leading-none">2</div>
                                    <p className="text-brand-200/90 leading-relaxed">Anotava <strong className="text-red-300">manualmente de caneta</strong> no papel qual prato alternativo desejava comer.</p>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-brand-900 flex items-center justify-center flex-shrink-0 mt-1 border border-brand-800 text-brand-400 font-mono text-sm leading-none">3</div>
                                    <p className="text-brand-200/90 leading-relaxed">No dia seguinte, a funcionária da roleta <strong className="text-red-300">sofria para procurar nomes em papéis rasurados</strong>, criando filas imensas.</p>
                                </li>
                            </ul>

                            <div className="mt-8 p-4 bg-red-950/30 rounded-2xl border border-red-900/30">
                                <p className="text-sm text-red-300 font-medium font-bold text-center">Resultado: Fila na roleta, produção às cegas, zero confiabilidade e muito desperdício.</p>
                            </div>
                        </motion.div>

                        {/* THE AFTER */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ delay: 0.2 }}
                            className="bg-brand-800/50 rounded-3xl p-8 border border-brand-500/30 food-shadow-elevated relative flex flex-col backdrop-blur-md"
                        >
                            <div className="absolute -top-4 -right-4 w-12 h-12 bg-brand-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-brand-500/30">
                                <span className="font-bold text-2xl">✓</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <span className="text-brand-400 text-sm uppercase tracking-wider font-bold">A Solução</span>
                                <br /> O Processo Limpo
                            </h3>

                            <ul className="space-y-6 flex-1">
                                <li className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0 mt-1 text-white font-mono text-sm leading-none font-bold">1</div>
                                    <p className="text-brand-50 leading-relaxed">O colaborador faz um breve cadastro e acessa o App na palma da mão, vendo o cardápio e alternativas do dia posterior a qualquer hora.</p>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0 mt-1 text-white font-mono text-sm leading-none font-bold">2</div>
                                    <p className="text-brand-50 leading-relaxed">Escolhe o prato no App. A cozinha recebe o pedido <strong className="text-brand-300">instantaneamente</strong> no Dashboard e já totaliza as quantidades de amanhã.</p>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0 mt-1 text-white font-mono text-sm leading-none font-bold">3</div>
                                    <p className="text-brand-50 leading-relaxed">No almoço, o funcionário só abre o Web-App e a roleta <strong className="text-brand-300">escaneia o QR Code dele</strong>, validando o pedido na fração de um segundo.</p>
                                </li>
                            </ul>

                            <div className="mt-8 p-4 bg-brand-900 rounded-2xl border border-brand-700">
                                <p className="text-sm text-brand-300 font-bold text-center">Resultado: Filas extintas na roleta, logística exata e zero papel ou erros de bandeja.</p>
                            </div>
                        </motion.div>

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
