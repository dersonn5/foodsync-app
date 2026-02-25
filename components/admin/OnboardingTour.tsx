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
    '/ceo': 'kitchenos_tour_ceo',
}

// =============================================
// DASHBOARD TOUR — Responsive
// Desktop: sidebar steps | Mobile/Tablet: bottom nav steps
// =============================================

// Steps that only exist on DESKTOP (sidebar visible ≥768px)
const desktopNavSteps: DriveStep[] = [
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
]

// Steps that only exist on MOBILE / TABLET (bottom nav visible <768px)
const mobileNavSteps: DriveStep[] = [
    {
        element: '#tour-mobile-nav',
        popover: {
            title: '📋 Menu de Navegação',
            description: 'Esta é a barra de navegação na parte inferior. Use para acessar Home, Pedidos, Cardápio e Gestão rapidamente.',
            side: 'top' as const,
            align: 'center' as const,
        },
    },
    {
        element: '#tour-mobile-scan',
        popover: {
            title: '📱 Scanner QR Code',
            description: 'O botão central abre o leitor de QR Code. Use-o para escanear o ticket do colaborador e confirmar a retirada do prato.',
            side: 'top' as const,
            align: 'center' as const,
        },
    },
]

// Steps common to all screen sizes
const dashboardCommonSteps: DriveStep[] = [
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
            side: 'top' as const,
            align: 'start' as const,
        },
    },
    {
        element: '#tour-satisfaction',
        popover: {
            title: '⭐ Satisfação dos Colaboradores',
            description: 'Widget compacto que mostra o nível de satisfação do dia com base nos feedbacks dos colaboradores sobre as refeições.',
            side: 'top' as const,
            align: 'center' as const,
        },
    },
    {
        element: '#tour-production',
        popover: {
            title: '👨‍🍳 Resumo de Produção',
            description: 'Visão completa da cozinha: quantidade de cada prato a ser produzido, com barras de progresso proporcionais.',
            side: 'top' as const,
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

// Build dashboard steps dynamically based on screen size
function getDashboardSteps(): DriveStep[] {
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768
    const navSteps = isDesktop ? desktopNavSteps : mobileNavSteps
    return [...navSteps, ...dashboardCommonSteps]
}

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

// =============================================
// CEO COCKPIT TOUR
// =============================================
const ceoSteps: DriveStep[] = [
    {
        element: '#tour-ceo-header',
        popover: {
            title: '🏢 Cockpit Executivo',
            description: 'Painel estratégico exclusivo para a diretoria. Visualize KPIs financeiros, eficiência operacional e tendências — tudo em tempo real.',
            side: 'bottom' as const,
            align: 'center' as const,
        },
    },
    {
        element: '#tour-ceo-filters',
        popover: {
            title: '🎛️ Filtros Estratégicos',
            description: 'Selecione a unidade (Visão Global ou filiais) e o período (Hoje, Semana, Mês, 30 dias) para analisar dados segmentados.',
            side: 'bottom' as const,
            align: 'center' as const,
        },
    },
    {
        element: '#tour-ceo-export',
        popover: {
            title: '📄 Exportar Relatório',
            description: 'Gere um PDF executivo com todos os indicadores para compartilhar em reuniões de diretoria.',
            side: 'bottom' as const,
            align: 'end' as const,
        },
    },
    {
        element: '#tour-ceo-kpis',
        popover: {
            title: '📊 KPIs Estratégicos',
            description: 'Quatro indicadores-chave: CMV Projetado (custo por refeição vs meta), Taxa de Rejeição, Volume de Refeições Servidas e Índice NPS de satisfação.',
            side: 'bottom' as const,
            align: 'center' as const,
        },
    },
    {
        element: '#tour-ceo-trend-chart',
        popover: {
            title: '📈 Evolução Custo vs Qualidade',
            description: 'Gráfico de tendência dos últimos 30 dias mostrando a relação entre investimento por prato e nota de qualidade. Ideal para identificar correlações.',
            side: 'top' as const,
            align: 'start' as const,
        },
    },
    {
        element: '#tour-ceo-heroes',
        popover: {
            title: '🏆 Heróis e Vilões do Cardápio',
            description: 'Top 3 pratos mais pedidos (Campeões) e os mais rejeitados (Vilões). Use para ajustar o cardápio e maximizar a satisfação.',
            side: 'top' as const,
            align: 'end' as const,
        },
    },
    {
        element: '#tour-ceo-leaderboard',
        popover: {
            title: '🏅 Ranking de Performance',
            description: 'Tabela comparativa entre unidades: total de pedidos, taxa de rejeição, custo estimado e status. Identifique unidades que precisam de atenção.',
            side: 'top' as const,
            align: 'center' as const,
        },
    },
]

// Map pages to their steps (dashboard resolved dynamically)
const STATIC_PAGE_TOURS: Record<string, DriveStep[]> = {
    '/admin/menu': menuSteps,
    '/admin/orders': ordersSteps,
    '/admin/reports': reportsSteps,
    '/ceo': ceoSteps,
}

function getStepsForPage(pathname: string): DriveStep[] | undefined {
    if (pathname === '/admin') return getDashboardSteps()
    return STATIC_PAGE_TOURS[pathname]
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
        if (!storageKey) return

        const hasCompletedTour = localStorage.getItem(storageKey)
        if (hasCompletedTour) return

        const steps = getStepsForPage(pathname)
        if (!steps) return

        // Wait for page data to load before starting
        const timer = setTimeout(() => {
            startTour(steps, storageKey)
        }, 2000)

        return () => clearTimeout(timer)
    }, [pathname, startTour])

    return null
}

