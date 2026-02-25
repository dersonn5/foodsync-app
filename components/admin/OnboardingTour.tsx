'use client'

import { useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { driver, DriveStep } from 'driver.js'
import 'driver.js/dist/driver.css'

// Storage keys per page
const TOUR_KEYS: Record<string, string> = {
    '/admin': 'kitchenos_tour_dashboard',
    '/admin/menu': 'kitchenos_tour_menu',
    '/admin/orders': 'kitchenos_tour_orders',
    '/admin/reports': 'kitchenos_tour_reports',
}

// =============================================
// DASHBOARD TOUR
// =============================================
const dashboardSteps: DriveStep[] = [
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

// =============================================
// MENU (CARDÁPIO) TOUR
// =============================================
const menuSteps: DriveStep[] = [
    {
        element: '#tour-menu-header',
        popover: {
            title: '🍽️ Planejamento de Cardápio',
            description: 'Nesta tela você monta o cardápio da semana inteira. Organize os pratos por dia e categoria para otimizar a produção da cozinha.',
            side: 'bottom' as const,
            align: 'center' as const,
        },
    },
    {
        element: '#tour-menu-week-nav',
        popover: {
            title: '📅 Navegação por Semana',
            description: 'Use as setas para avançar ou retroceder entre semanas. O número da semana e o intervalo de datas são exibidos no centro.',
            side: 'bottom' as const,
            align: 'center' as const,
        },
    },
    {
        element: '#tour-menu-pipeline',
        popover: {
            title: '📊 Pipeline Semanal',
            description: 'Cada coluna representa um dia da semana (segunda a sexta). O dia atual é destacado com borda verde e badge "Hoje".',
            side: 'top' as const,
            align: 'center' as const,
        },
    },
    {
        element: '#tour-menu-day-card',
        popover: {
            title: '📋 Coluna do Dia',
            description: 'Cada coluna mostra os pratos cadastrados para aquele dia. Os cards exibem foto, nome, tipo (Padrão, Fit ou Lanche) e descrição.',
            side: 'right' as const,
            align: 'start' as const,
        },
    },
    {
        element: '#tour-menu-add-btn',
        popover: {
            title: '➕ Adicionar Prato',
            description: 'Clique neste botão para abrir o formulário e cadastrar um novo prato no dia correspondente. Defina nome, categoria, foto e ingredientes.',
            side: 'top' as const,
            align: 'center' as const,
        },
    },
]

// =============================================
// ORDERS (PEDIDOS) TOUR
// =============================================
const ordersSteps: DriveStep[] = [
    {
        element: '#tour-orders-header',
        popover: {
            title: '📦 Gestão de Pedidos',
            description: 'Central de controle de todos os pedidos dos colaboradores. Aqui você confirma, cancela e acompanha cada solicitação.',
            side: 'bottom' as const,
            align: 'center' as const,
        },
    },
    {
        element: '#tour-orders-date-nav',
        popover: {
            title: '📅 Navegação por Data',
            description: 'Navegue entre os dias para ver pedidos passados ou futuros. A data atual é o padrão.',
            side: 'bottom' as const,
            align: 'center' as const,
        },
    },
    {
        element: '#tour-orders-filter',
        popover: {
            title: '🔍 Filtro por Status',
            description: 'Filtre rapidamente entre Todos, Pendentes ou Confirmados. Ideal para priorizar pedidos que precisam de ação.',
            side: 'bottom' as const,
            align: 'center' as const,
        },
    },
    {
        element: '#tour-orders-kpis',
        popover: {
            title: '📊 Resumo do Dia',
            description: 'Três indicadores: Total de pedidos, Cancelados e Pendentes. O card de pendentes fica amarelo quando há itens aguardando.',
            side: 'bottom' as const,
            align: 'center' as const,
        },
    },
    {
        element: '#tour-orders-search',
        popover: {
            title: '🔎 Busca Rápida',
            description: 'Digite o nome do colaborador ou do prato para localizar pedidos específicos instantaneamente.',
            side: 'bottom' as const,
            align: 'start' as const,
        },
    },
    {
        element: '#tour-orders-list',
        popover: {
            title: '📋 Lista de Pedidos',
            description: 'Cada item mostra o colaborador, prato escolhido, horário e status. Pedidos pendentes têm botões de Confirmar e Cancelar para ação rápida.',
            side: 'top' as const,
            align: 'center' as const,
        },
    },
]

// =============================================
// REPORTS (RELATÓRIOS) TOUR
// =============================================
const reportsSteps: DriveStep[] = [
    {
        element: '#tour-reports-header',
        popover: {
            title: '📊 Relatórios de Eficiência',
            description: 'Painel analítico completo para monitorar a eficiência da operação, controlar desperdício e planejar a produção.',
            side: 'bottom' as const,
            align: 'center' as const,
        },
    },
    {
        element: '#tour-reports-period',
        popover: {
            title: '📅 Seletor de Período',
            description: 'Alterne entre "Esta Semana", "Este Mês" ou "Mês Passado" para comparar métricas em diferentes intervalos de tempo.',
            side: 'bottom' as const,
            align: 'end' as const,
        },
    },
    {
        element: '#tour-reports-kpis',
        popover: {
            title: '📈 KPIs Estratégicos',
            description: 'Taxa de Eficiência (% de pedidos que foram efetivamente servidos), Desperdício Evitado (cancelamentos) e Produção Total (pratos confirmados).',
            side: 'bottom' as const,
            align: 'center' as const,
        },
    },
    {
        element: '#tour-reports-rejection',
        popover: {
            title: '🚨 Radar de Rejeição',
            description: 'Identifique quais pratos têm maior taxa de cancelamento. Essencial para ajustar o cardápio e reduzir desperdício.',
            side: 'right' as const,
            align: 'start' as const,
        },
    },
    {
        element: '#tour-reports-production',
        popover: {
            title: '👨‍🍳 Guia de Produção',
            description: 'Ranking dos pratos mais pedidos com as quantidades confirmadas. Use para dimensionar a produção e compras.',
            side: 'left' as const,
            align: 'start' as const,
        },
    },
    {
        element: '#tour-reports-satisfaction',
        popover: {
            title: '⭐ Métricas de Satisfação',
            description: 'Análise detalhada dos feedbacks dos colaboradores: notas médias, distribuição e tendências por período.',
            side: 'top' as const,
            align: 'center' as const,
        },
    },
]

// Map pages to their steps
const PAGE_TOURS: Record<string, DriveStep[]> = {
    '/admin': dashboardSteps,
    '/admin/menu': menuSteps,
    '/admin/orders': ordersSteps,
    '/admin/reports': reportsSteps,
}

export function resetOnboardingTour() {
    if (typeof window !== 'undefined') {
        Object.values(TOUR_KEYS).forEach(key => localStorage.removeItem(key))
    }
}

export function OnboardingTour() {
    const pathname = usePathname()

    const startTour = useCallback((steps: DriveStep[], storageKey: string) => {
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
            steps,
            onDestroyStarted: () => {
                localStorage.setItem(storageKey, 'true')
                driverObj.destroy()
            },
        })

        driverObj.drive()
    }, [])

    useEffect(() => {
        const storageKey = TOUR_KEYS[pathname]
        const steps = PAGE_TOURS[pathname]

        if (!storageKey || !steps) return

        const hasCompletedTour = localStorage.getItem(storageKey)
        if (hasCompletedTour) return

        // Wait for page data to load before starting
        const timer = setTimeout(() => {
            startTour(steps, storageKey)
        }, 2000)

        return () => clearTimeout(timer)
    }, [pathname, startTour])

    return null
}
