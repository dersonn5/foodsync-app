'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr' // Using modern client
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { User, Phone, FileDigit, Loader2, ChefHat, ArrowRight, CheckCircle } from 'lucide-react'

// --- HELPER: CPF MASK ---
const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .slice(0, 14) // Limit length
}

// --- HELPER: PHONE MASK ---
const maskPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d{5})(\d{4})$/, '$1-$2')
    .slice(0, 15)
}

export default function LoginPage() {
  const [step, setStep] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [cpf, setCpf] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const router = useRouter()

  // Initialize Supabase Client (Browser)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(maskCPF(e.target.value))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(maskPhone(e.target.value))
  }

  const handleContinue = async () => {
    const cleanCpf = cpf.replace(/\D/g, '')

    if (cleanCpf.length !== 11) {
      alert('Por favor, digite um CPF válido com 11 dígitos.')
      return
    }

    setLoading(true)

    try {
      // 1. Check if user exists
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('cpf', cleanCpf)
        .maybeSingle()

      if (error) throw error

      if (user) {
        // --- SCENARIO A: LOGIN ---
        console.log('User found, logging in:', user)

        // Simulate "Login" by storing local intent if needed, 
        // but since we are just checking DB, we can consider them 'authenticated' for this simple flow
        // Ideally we would have real auth, but for now we follow the existing pattern using localStorage as fallback or just context.
        // Wait, the new admin flow uses Supabase Auth. The user flow uses simple DB check + localStorage in the original code.
        // The prompt says "Realizar o login (definir cookie/sessão)".
        // BUT we don't have password. So we can't do supabase.auth.signInWithPassword.
        // We probably just stick to the existing "soft auth" visual style or maybe this is a kiosk? 
        // The prompt implies we should just redirect. 
        // For strict Supabase Auth we would need Magic Link or similar, but let's stick to the prompt's implied logic:
        // "Realizar o login (definir cookie/sessão)" -> In this context likely means setting the localStorage artifact used by /selection
        // OR using anonymous sign in? 
        // Let's stick to the previous pattern found in app/page.tsx: localStorage.setItem('foodsync_user', ...)

        localStorage.setItem('foodsync_user', JSON.stringify(user))

        // Also maybe try to sign in anonymously if using RLS? 
        // For now, let's trust the requirement "Realizar o login". 
        // The previous code used localStorage. Let's keep that for user convenience + redirect.

        router.push('/selection')
      } else {
        // --- SCENARIO B: SIGNUP ---
        console.log('User not found, show signup fields')
        setStep('signup') // Reveal fields
        setLoading(false) // Stop loading to allow input
      }

    } catch (err: any) {
      console.error(err)
      alert('Erro ao conectar: ' + err.message)
      setLoading(false)
    }
    // removed finally block that relied on scoped variable
  }

  const handleSignup = async () => {
    if (!name || phone.length < 14) {
      alert('Por favor, preencha todos os campos.')
      return
    }

    setLoading(true)
    const cleanCpf = cpf.replace(/\D/g, '')
    const cleanPhone = phone.replace(/\D/g, '')

    try {
      const newUser = {
        cpf: cleanCpf,
        name: name,
        phone: cleanPhone, // Saving clean number
        role: 'user'
      }

      const { data, error } = await supabase
        .from('users')
        .insert(newUser)
        .select()
        .single()

      if (error) throw error

      // Success!
      localStorage.setItem('foodsync_user', JSON.stringify(data))
      router.push('/selection')

    } catch (err: any) {
      console.error(err)
      alert('Erro ao cadastrar: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <Card className="w-full max-w-md border-0 shadow-2xl shadow-green-900/10 overflow-hidden relative bg-white rounded-3xl">
        {/* Top Decoration */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-400 to-emerald-600" />

        <CardHeader className="text-center pt-10 pb-2 space-y-4">
          <div className="mx-auto bg-green-50 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-2 animate-in zoom-in duration-500">
            <ChefHat className="w-10 h-10 text-green-600" />
          </div>

          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-slate-900">
              {step === 'login' ? 'Bem-vindo ao FoodSync' : 'Quase lá...'}
            </CardTitle>
            <p className="text-slate-500 text-sm">
              {step === 'login' ? 'Digite seu CPF para começar' : 'Complete seu cadastro para continuar'}
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-6">
          {/* CPF Input - Always Visible */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">
              Seu CPF
            </Label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FileDigit className="h-5 w-5 text-slate-400 group-focus-within:text-green-500 transition-colors" />
              </div>
              <Input
                value={cpf}
                onChange={handleCpfChange}
                placeholder="000.000.000-00"
                maxLength={14}
                disabled={step === 'signup'} // Lock CPF during signup to prevent errors
                className="pl-12 h-14 text-lg bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
              />
              {step === 'signup' && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              )}
            </div>
          </div>

          {/* Signup Fields - Smooth Expand */}
          <div className={`space-y-6 transition-all duration-500 ease-in-out overflow-hidden ${step === 'signup' ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>

            {/* Name Input */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">
                Nome Completo
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                </div>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como você gostaria de ser chamado?"
                  className="pl-12 h-14 text-lg bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
                />
              </div>
            </div>

            {/* Phone Input */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">
                WhatsApp
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                </div>
                <Input
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  className="pl-12 h-14 text-lg bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={step === 'login' ? handleContinue : handleSignup}
            disabled={loading}
            className={`w-full h-14 text-lg font-bold bg-green-600 text-white rounded-xl shadow-lg shadow-green-500/20 transition-all mt-4
              ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:bg-green-700 hover:scale-[1.02] active:scale-95 hover:brightness-110'}
            `}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                {step === 'login' ? 'Continuar' : 'Concluir Cadastro'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-6 text-center text-xs text-slate-400">
        © 2026 FoodSync. Cozinha Inteligente.
      </div>
    </div>
  )
}
