'use client'

import { useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

const TOUR_STORAGE_KEY = 'kitchenos_tour_done'

const tourSteps = [
    {
        element: '#tour-sidebar',
        popover: {
            title: '📋 Menu de Navegação',
            description: 'Este é o menu principal do sistema. Aqui você acessa todas as áreas: Dashboard, Cardápio, Pedidos, Relatórios e Configurações.',
            side: 'right' as const,
            align: 'center' as const,
        },
    },
    {
        element: '#tour-sidebar-nav',
        popover: {
            title: '🧭 Acesso Rápido',
            description: 'Cada item leva você a uma seção específica. O item ativo fica destacado em verde. Navegue entre as áreas com um clique.',
            side: 'right' as const,
            align: 'start' as const,
        },
    },
    {
        element: '#tour-ceo-link',
        popover: {
            title: '📊 Visão CEO',
            description: 'Acesso exclusivo ao painel estratégico com métricas de alto nível, ideal para a diretoria acompanhar o desempenho da operação.',
            side: 'right' as const,
            align: 'center' as const,
        },
    },
    {
        element: '#tour-header',
        popover: {
            title: '👋 Cabeçalho Inteligente',
            description: 'O header mostra uma saudação personalizada e o resumo do dia. Ele fica fixo no topo para acesso rápido.',
            side: 'bottom' as const,
            align: 'center' as const,
        },
    },
    {
        element: '#tour-notification',
        popover: {
            title: '🔔 Central de Notificações',
            description: 'Receba alertas em tempo real sobre novos pedidos, cancelamentos e atualizações importantes do sistema.',
            side: 'bottom' as const,
            align: 'end' as const,
        },
    },
    {
        element: '#tour-kpi-cards',
        popover: {
            title: '📈 Indicadores do Dia (KPIs)',
            description: 'Três métricas essenciais: Total de Pedidos, Cancelamentos e Fila Pendente. Atualizados automaticamente em tempo real.',
            side: 'bottom' as const,
            align: 'center' as const,
        },
    },
    {
        element: '#tour-date-nav',
        popover: {
            title: '📅 Navegação por Data',
            description: 'Use as setas para navegar entre dias e ver o histórico de pedidos. O botão "Hoje" retorna ao dia atual instantaneamente.',
            side: 'bottom' as const,
            align: 'center' as const,
        },
    },
    {
        element: '#tour-feed',
        popover: {
            title: '🍽️ Feed em Tempo Real',
            description: 'Acompanhe todos os pedidos à medida que chegam. Cada card mostra o colaborador, prato escolhido, status e horário.',
            side: 'left' as const,
            align: 'start' as const,
        },
    },
    {
        element: '#tour-satisfaction',
        popover: {
            title: '⭐ Satisfação dos Colaboradores',
            description: 'Widget compacto que mostra o nível de satisfação do dia com base nos feedbacks dos colaboradores sobre as refeições.',
            side: 'left' as const,
            align: 'center' as const,
        },
    },
    {
        element: '#tour-production',
        popover: {
            title: '👨‍🍳 Resumo de Produção',
            description: 'Visão completa da cozinha: quantidade de cada prato a ser produzido, com barras de progresso proporcionais.',
            side: 'left' as const,
            align: 'start' as const,
        },
    },
    {
        element: '#tour-export',
        popover: {
            title: '🖨️ Exportar Lista',
            description: 'Baixe a lista de pedidos do dia em CSV para impressão de contingência ou controle offline.',
            side: 'bottom' as const,
            align: 'end' as const,
        },
    },
]

export function resetOnboardingTour() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(TOUR_STORAGE_KEY)
    }
}

export function OnboardingTour() {
    const pathname = usePathname()

    const startTour = useCallback(() => {
        const driverObj = driver({
            showProgress: true,
            animate: true,
            overlayColor: 'rgba(15, 42, 29, 0.75)',
            stagePadding: 8,
            stageRadius: 16,
            popoverClass: 'kitchenos-tour-popover',
            nextBtnText: 'Próximo →',
            prevBtnText: '← Anterior',
            doneBtnText: '✅ Concluir',
            progressText: '{{current}} de {{total}}',
            steps: tourSteps,
            onDestroyStarted: () => {
                localStorage.setItem(TOUR_STORAGE_KEY, 'true')
                driverObj.destroy()
            },
        })

        driverObj.drive()
    }, [])

    useEffect(() => {
        // Only trigger on the main dashboard page
        if (pathname !== '/admin') return

        const hasCompletedTour = localStorage.getItem(TOUR_STORAGE_KEY)
        if (hasCompletedTour) return

        // Wait for dashboard data to load before starting
        const timer = setTimeout(() => {
            startTour()
        }, 2000)

        return () => clearTimeout(timer)
    }, [pathname, startTour])

    return null // This is a logic-only component
}
