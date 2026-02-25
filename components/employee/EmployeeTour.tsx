'use client'

import { useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { driver, DriveStep } from 'driver.js'
import 'driver.js/dist/driver.css'

// Storage keys — one per employee page
const EMPLOYEE_TOUR_KEYS: Record<string, string> = {
    '/selection': 'kitchenos_emp_tour_selection',
    '/orders': 'kitchenos_emp_tour_orders',
    '/feedback': 'kitchenos_emp_tour_feedback',
    '/profile': 'kitchenos_emp_tour_profile',
}

// =============================================
// 1️⃣ CARDÁPIO (SELECTION) — The Main Story
// "Como escolher sua refeição"
// =============================================
const selectionSteps: DriveStep[] = [
    {
        popover: {
            title: '👋 Bem-vindo ao KitchenOS!',
            description: 'Este é o sistema de reserva de refeições da sua empresa. Vamos te guiar pelo processo completo: da escolha do prato até a retirada na cozinha. É rápido e simples!',
        },
    },
    {
        element: '#tour-emp-header',
        popover: {
            title: '🍽️ Sua Área Pessoal',
            description: 'Aqui você vê sua saudação e pode sair do sistema pelo botão no canto superior direito.',
            side: 'bottom' as const,
            align: 'center' as const,
        },
    },
    {
        element: '#tour-emp-calendar',
        popover: {
            title: '📅 Passo 1: Escolha o Dia',
            description: 'Deslize para ver os próximos 14 dias. Toque no dia para o qual deseja reservar sua refeição. O dia selecionado fica destacado em verde escuro.',
            side: 'bottom' as const,
            align: 'start' as const,
        },
    },
    {
        element: '#tour-emp-filters',
        popover: {
            title: '🏷️ Filtre por Categoria',
            description: 'Use os filtros para ver apenas pratos Padrão, Fit (saudáveis) ou Lanches. "Todos" mostra o cardápio completo do dia.',
            side: 'bottom' as const,
            align: 'start' as const,
        },
    },
    {
        element: '#tour-emp-menu-title',
        popover: {
            title: '📋 Cardápio do Dia',
            description: 'Aqui aparecem todos os pratos disponíveis para o dia selecionado. Cada card mostra a foto, nome, categoria e descrição do prato.',
            side: 'bottom' as const,
            align: 'center' as const,
        },
    },
    {
        element: '#tour-emp-menu-cards',
        popover: {
            title: '👆 Passo 2: Toque no Prato',
            description: 'Para escolher seu prato, basta tocar no card. Ele ficará destacado com uma borda verde. Você só pode escolher um prato por dia.',
            side: 'top' as const,
            align: 'center' as const,
        },
    },
    {
        popover: {
            title: '✅ Passo 3: Confirme sua Reserva',
            description: 'Após selecionar o prato, um botão verde "Confirmar Reserva" aparece na parte inferior da tela. Toque nele para finalizar! Você receberá uma confirmação por WhatsApp.',
        },
    },
    {
        element: '#tour-emp-bottom-nav',
        popover: {
            title: '🧭 Navegação do App',
            description: 'Use a barra inferior para navegar entre as seções: Cardápio (escolher prato), Feedback (avaliar refeição), Pedidos (ver QR Code) e Perfil (seus dados).',
            side: 'top' as const,
            align: 'center' as const,
        },
    },
    {
        popover: {
            title: '🎫 O que acontece depois?',
            description: 'Após confirmar, vá em "Pedidos" para ver seu QR Code. Na hora da refeição, apresente o QR Code na cozinha para retirar seu prato. Simples assim! 🍕',
        },
    },
]

// =============================================
// 2️⃣ PEDIDOS — "Seu ticket de retirada"
// =============================================
const ordersSteps: DriveStep[] = [
    {
        element: '#tour-emp-orders-header',
        popover: {
            title: '🎫 Seus Pedidos',
            description: 'Aqui ficam todas as suas reservas futuras. Cada pedido representa uma refeição que você já garantiu.',
            side: 'bottom' as const,
            align: 'center' as const,
        },
    },
    {
        element: '#tour-emp-orders-list',
        popover: {
            title: '📋 Lista de Reservas',
            description: 'Cada card mostra a data, o prato reservado e o status (Confirmado ou Pendente). Toque em qualquer pedido para ver os detalhes.',
            side: 'top' as const,
            align: 'center' as const,
        },
    },
    {
        popover: {
            title: '📱 QR Code de Retirada',
            description: 'Ao tocar no pedido, um ticket digital abre com seu QR Code exclusivo. Na hora do almoço, mostre este código na cozinha para confirmar a retirada do prato. Este é seu "ticket" digital!',
        },
    },
]

// =============================================
// 3️⃣ FEEDBACK — "Avalie sua experiência"
// =============================================
const feedbackSteps: DriveStep[] = [
    {
        element: '#tour-emp-feedback-header',
        popover: {
            title: '⭐ Avaliação da Refeição',
            description: 'Após almoçar, avalie a qualidade da refeição aqui. Seu feedback ajuda a cozinha a melhorar continuamente! Disponível entre 11h e 15h.',
            side: 'bottom' as const,
            align: 'center' as const,
        },
    },
    {
        element: '#tour-emp-feedback-stars',
        popover: {
            title: '⭐ Dê sua Nota',
            description: 'Toque nas estrelas para dar uma nota de 1 a 5. Quanto mais estrelas, mais satisfeito você está com a refeição.',
            side: 'bottom' as const,
            align: 'center' as const,
        },
    },
    {
        element: '#tour-emp-feedback-comment',
        popover: {
            title: '💬 Deixe um Comentário',
            description: 'Opcionalmente, descreva o que gostou ou o que pode melhorar: sabor, temperatura, apresentação, etc. Sua opinião faz a diferença!',
            side: 'top' as const,
            align: 'center' as const,
        },
    },
]

// =============================================
// 4️⃣ PERFIL — "Seus dados"
// =============================================
const profileSteps: DriveStep[] = [
    {
        element: '#tour-emp-profile-header',
        popover: {
            title: '👤 Seu Perfil',
            description: 'Aqui estão suas informações pessoais cadastradas no sistema: nome, telefone, CPF e unidade.',
            side: 'bottom' as const,
            align: 'center' as const,
        },
    },
    {
        element: '#tour-emp-profile-card',
        popover: {
            title: '📇 Dados Pessoais',
            description: 'Suas informações de cadastro. Caso precise alterar algo, entre em contato com o administrador da sua unidade.',
            side: 'top' as const,
            align: 'center' as const,
        },
    },
    {
        element: '#tour-emp-profile-actions',
        popover: {
            title: '🚪 Ações',
            description: 'Acesse seus pedidos diretamente ou saia do aplicativo. Ao sair, você precisará fazer login novamente com seu CPF.',
            side: 'top' as const,
            align: 'center' as const,
        },
    },
]

// Map pages to their steps
const EMPLOYEE_PAGE_TOURS: Record<string, DriveStep[]> = {
    '/selection': selectionSteps,
    '/orders': ordersSteps,
    '/feedback': feedbackSteps,
    '/profile': profileSteps,
}

export function resetEmployeeTour() {
    if (typeof window !== 'undefined') {
        Object.values(EMPLOYEE_TOUR_KEYS).forEach(key => localStorage.removeItem(key))
    }
}

export function EmployeeTour() {
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
            doneBtnText: '✅ Entendi!',
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
        const storageKey = EMPLOYEE_TOUR_KEYS[pathname]
        const steps = EMPLOYEE_PAGE_TOURS[pathname]

        if (!storageKey || !steps) return

        const hasCompletedTour = localStorage.getItem(storageKey)
        if (hasCompletedTour) return

        // Wait for page data to load
        const timer = setTimeout(() => {
            startTour(steps, storageKey)
        }, 1500)

        return () => clearTimeout(timer)
    }, [pathname, startTour])

    return null
}
