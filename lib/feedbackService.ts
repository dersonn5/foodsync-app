import { supabase } from './supabase'
import { format } from 'date-fns'

// ============================================
// FoodSync Feedback Service
// ============================================

/**
 * Feedback cutoff hour (15:00 / 3 PM)
 * Employees can only submit feedback before this time.
 */
const FEEDBACK_CUTOFF_HOUR = 15

/**
 * Check if current time is within the feedback submission window.
 * Feedback is allowed from 00:00 to 15:00 (3 PM).
 * 
 * @returns true if feedback can be submitted, false otherwise
 */
export function isWithinFeedbackWindow(): boolean {
    const now = new Date()
    const currentHour = now.getHours()
    return currentHour < FEEDBACK_CUTOFF_HOUR
}

/**
 * Get the cutoff time message for display
 */
export function getFeedbackCutoffMessage(): string {
    return `A avaliação da refeição de hoje encerrou às ${FEEDBACK_CUTOFF_HOUR}h.`
}

// Types
export interface FeedbackSubmission {
    funcionarioId: string
    nota: number // 1-5
    comentario?: string
    unidadeCozinha?: string
}

export interface FeedbackRecord {
    id: string
    created_at: string
    funcionario_id: string
    unidade_cozinha: string
    nota: number
    comentario: string | null
    data_refeicao: string
    users?: {
        name: string
    }
}

export interface FeedbackMetrics {
    averageRating: number
    totalFeedbacks: number
    ratingDistribution: Record<number, number>
    recentComments: Array<{
        userName: string
        comentario: string
        nota: number
        created_at: string
    }>
}

/**
 * Submit a meal feedback
 */
export async function submitFeedback({
    funcionarioId,
    nota,
    comentario,
    unidadeCozinha = 'Cozinha Principal'
}: FeedbackSubmission): Promise<{ success: boolean; error?: string }> {
    // Validate time window
    if (!isWithinFeedbackWindow()) {
        return { success: false, error: getFeedbackCutoffMessage() }
    }

    // Validate rating
    if (nota < 1 || nota > 5) {
        return { success: false, error: 'A nota deve ser de 1 a 5 estrelas.' }
    }

    const today = format(new Date(), 'yyyy-MM-dd')

    try {
        const { error } = await supabase
            .from('feedbacks_app')
            .insert({
                funcionario_id: funcionarioId,
                unidade_cozinha: unidadeCozinha,
                nota,
                comentario: comentario?.trim() || null,
                data_refeicao: today
            })

        if (error) {
            // Handle duplicate constraint
            if (error.code === '23505') {
                return { success: false, error: 'Você já avaliou a refeição de hoje.' }
            }
            console.error('Feedback insert error:', error)
            return { success: false, error: 'Erro ao salvar avaliação. Tente novamente.' }
        }

        return { success: true }
    } catch (err) {
        console.error('Feedback submission failed:', err)
        return { success: false, error: 'Erro de conexão. Tente novamente.' }
    }
}

/**
 * Check if user has already submitted feedback for today
 */
export async function hasSubmittedToday(funcionarioId: string): Promise<boolean> {
    const today = format(new Date(), 'yyyy-MM-dd')

    const { data } = await supabase
        .from('feedbacks_app')
        .select('id')
        .eq('funcionario_id', funcionarioId)
        .eq('data_refeicao', today)
        .maybeSingle()

    return !!data
}

/**
 * Get feedbacks for a specific date (Manager view)
 */
export async function getFeedbacksForDate(date: string): Promise<FeedbackRecord[]> {
    const { data, error } = await supabase
        .from('feedbacks_app')
        .select(`
            *,
            users (name)
        `)
        .eq('data_refeicao', date)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching feedbacks:', error)
        return []
    }

    return data || []
}

/**
 * Get feedback metrics for a date range (CEO view)
 */
export async function getFeedbackMetrics(
    startDate: string,
    endDate: string,
    unidadeCozinha?: string
): Promise<FeedbackMetrics> {
    let query = supabase
        .from('feedbacks_app')
        .select(`
            *,
            users (name)
        `)
        .gte('data_refeicao', startDate)
        .lte('data_refeicao', endDate)
        .order('created_at', { ascending: false })

    if (unidadeCozinha) {
        query = query.eq('unidade_cozinha', unidadeCozinha)
    }

    const { data, error } = await query

    if (error || !data || data.length === 0) {
        return {
            averageRating: 0,
            totalFeedbacks: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            recentComments: []
        }
    }

    // Calculate average
    const sum = data.reduce((acc, f) => acc + f.nota, 0)
    const averageRating = sum / data.length

    // Rating distribution
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    data.forEach(f => {
        ratingDistribution[f.nota] = (ratingDistribution[f.nota] || 0) + 1
    })

    // Recent comments (with content only)
    const recentComments = data
        .filter(f => f.comentario && f.comentario.trim().length > 0)
        .slice(0, 10)
        .map(f => ({
            userName: f.users?.name || 'Funcionário',
            comentario: f.comentario!,
            nota: f.nota,
            created_at: f.created_at
        }))

    return {
        averageRating,
        totalFeedbacks: data.length,
        ratingDistribution,
        recentComments
    }
}

/**
 * Get daily average ratings for charts (CEO view)
 */
export async function getDailyAverages(
    startDate: string,
    endDate: string
): Promise<Array<{ date: string; average: number; count: number }>> {
    const { data, error } = await supabase
        .from('feedbacks_app')
        .select('data_refeicao, nota')
        .gte('data_refeicao', startDate)
        .lte('data_refeicao', endDate)
        .order('data_refeicao', { ascending: true })

    if (error || !data) return []

    // Group by date
    const grouped: Record<string, number[]> = {}
    data.forEach(f => {
        if (!grouped[f.data_refeicao]) grouped[f.data_refeicao] = []
        grouped[f.data_refeicao].push(f.nota)
    })

    return Object.entries(grouped).map(([date, notas]) => ({
        date,
        average: notas.reduce((a, b) => a + b, 0) / notas.length,
        count: notas.length
    }))
}

/**
 * Get unit rankings (CEO view)
 */
export async function getUnitRankings(
    startDate: string,
    endDate: string
): Promise<Array<{ unidade: string; average: number; total: number }>> {
    const { data, error } = await supabase
        .from('feedbacks_app')
        .select('unidade_cozinha, nota')
        .gte('data_refeicao', startDate)
        .lte('data_refeicao', endDate)

    if (error || !data) return []

    // Group by unit
    const grouped: Record<string, number[]> = {}
    data.forEach(f => {
        if (!grouped[f.unidade_cozinha]) grouped[f.unidade_cozinha] = []
        grouped[f.unidade_cozinha].push(f.nota)
    })

    return Object.entries(grouped)
        .map(([unidade, notas]) => ({
            unidade,
            average: notas.reduce((a, b) => a + b, 0) / notas.length,
            total: notas.length
        }))
        .sort((a, b) => b.average - a.average)
}
