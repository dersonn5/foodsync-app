'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { User, Phone, FileDigit, Loader2, ChefHat, ArrowRight, CheckCircle, Utensils } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// --- HELPER: CPF MASK ---
const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .slice(0, 14)
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
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('cpf', cleanCpf)
        .maybeSingle()

      if (error) throw error

      if (user) {
        console.log('User found, logging in:', user)
        localStorage.setItem('kitchenos_user', JSON.stringify(user))
        router.push('/selection')
      } else {
        console.log('User not found, show signup fields')
        setStep('signup')
        setLoading(false)
      }

    } catch (err: any) {
      console.error(err)
      alert('Erro ao conectar: ' + err.message)
      setLoading(false)
    }
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
        phone: cleanPhone,
        role: 'user'
      }

      const { data, error } = await supabase
        .from('users')
        .insert(newUser)
        .select()
        .single()

      if (error) throw error

      localStorage.setItem('kitchenos_user', JSON.stringify(data))
      router.push('/selection')

    } catch (err: any) {
      console.error(err)
      alert('Erro ao cadastrar: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 font-sans selection:bg-primary/20 selection:text-primary relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      {/* Floating Icons */}
      <motion.div
        className="absolute top-20 left-10 text-primary/20 hidden md:block"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Utensils className="w-12 h-12" />
      </motion.div>
      <motion.div
        className="absolute bottom-20 right-10 text-accent/20 hidden md:block"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChefHat className="w-16 h-16" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-[420px] relative z-10"
      >
        <Card className="border border-border shadow-xl bg-card/95 backdrop-blur-md rounded-3xl overflow-hidden">
          {/* Top Gradient Bar */}
          <div className="h-1.5 w-full" style={{ background: 'var(--gradient-brand)' }} />

          <CardHeader className="pt-10 pb-6 text-center space-y-4">
            <motion.div
              className="mx-auto bg-primary/10 p-4 rounded-2xl w-20 h-20 flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <ChefHat className="w-10 h-10 text-primary" />
            </motion.div>

            <div className="space-y-1.5">
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                {step === 'login' ? 'Bem-vindo ao KitchenOS' : 'Quase lá...'}
              </CardTitle>
              <p className="text-muted-foreground text-sm font-medium">
                {step === 'login' ? 'Digite seu CPF para começar' : 'Complete seu cadastro para continuar'}
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-8 pt-2 space-y-6">
            {/* CPF Input */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                Seu CPF
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FileDigit className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  value={cpf}
                  onChange={handleCpfChange}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  disabled={step === 'signup'}
                  className="pl-12 h-14 text-lg bg-muted/50 border-transparent focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl transition-all placeholder:text-muted-foreground/50 font-medium text-foreground"
                />
                <AnimatePresence>
                  {step === 'signup' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Signup Fields */}
            <AnimatePresence>
              {step === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-5 overflow-hidden"
                >
                  {/* Name Input */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                      Nome Completo
                    </Label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      </div>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Como você gostaria de ser chamado?"
                        className="pl-12 h-14 text-lg bg-muted/50 border-transparent focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl transition-all placeholder:text-muted-foreground/50 font-medium text-foreground"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Phone Input */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                      WhatsApp
                    </Label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      </div>
                      <Input
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                        className="pl-12 h-14 text-lg bg-muted/50 border-transparent focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl transition-all placeholder:text-muted-foreground/50 font-medium text-foreground"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Button */}
            <motion.div whileTap={{ scale: 0.96 }}>
              <Button
                onClick={step === 'login' ? handleContinue : handleSignup}
                disabled={loading}
                className={`w-full h-14 text-lg font-bold bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/20 hover:brightness-110 transition-all mt-2
                  ${loading ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {loading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center"
                  >
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    <span>Processando...</span>
                  </motion.div>
                ) : (
                  <div className="flex items-center">
                    {step === 'login' ? 'Continuar' : 'Concluir Cadastro'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </div>
                )}
              </Button>
            </motion.div>
          </CardContent>
        </Card>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-sm font-medium text-muted-foreground"
        >
          © 2026 KitchenOS. Cozinha Inteligente.
        </motion.div>
      </motion.div>
    </div>
  )
}
