'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@/types'
import { useRouter } from 'next/navigation'

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        // Check local storage on mount (simple persistence)
        const storedUser = localStorage.getItem('zw_user')
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
    }, [])

    const login = async (cpf: string) => {
        setLoading(true)
        setError(null)

        const cpfLimpo = cpf.replace(/\D/g, '')
        console.log('CPF Original:', cpf)
        console.log('CPF Limpo:', cpfLimpo)

        try {
            // Query for either raw CPF or cleaned CPF
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .or(`cpf.eq.${cpf},cpf.eq.${cpfLimpo}`)
                .maybeSingle() // Use maybeSingle instead of single to avoid error if 0 rows (though single throws, maybeSingle returns null)
            // User said "Supabase ... retornando erro no .single()". 
            // If 0 rows, single() returns code: 'PGRST116'. 
            // But we want to handle "User not found" gracefully. 
            // maybeSingle() returns data=null if not found, instead of error.

            if (error) {
                throw error
            }

            if (data) {
                console.log('Usuário encontrado:', data)
                setUser(data)
                localStorage.setItem('zw_user', JSON.stringify(data))
                router.push('/selection')
            } else {
                console.warn('Usuário não encontrado.')
                setError('Usuário não encontrado. Verifique o CPF.')
            }
        } catch (err: any) {
            console.error('Erro detalhado:', err.message, err.details, err.hint)
            setError('Erro ao entrar. Verifique o console para mais detalhes.')
        } finally {
            setLoading(false)
        }
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('kitchenos_user')
        router.push('/')
    }

    return { user, loading, error, login, logout }
}
