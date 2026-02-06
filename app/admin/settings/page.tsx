'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import {
    Store,
    Clock,
    Bell,
    Shield,
    Save,
    UtensilsCrossed,
    Palette,
    User,
    Lock,
    Globe,
    CheckCircle2,
    ChefHat
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Toaster, toast } from 'sonner'

export default function SettingsPage() {
    const router = useRouter()
    const supabase = createClient()
    const [user, setUser] = useState<any>(null)
    const [activeTab, setActiveTab] = useState('unit')
    const [loading, setLoading] = useState(false)

    // Form States (Local State Mock)
    const [formData, setFormData] = useState({
        // Unit & Ops
        unitName: 'Matriz - Cozinha Central',
        supportPhone: '(11) 99999-0000',
        supportEmail: 'relacionamento@kitchenos.app',
        orderCutoff: '10:00',
        minNotice: '24h',
        dagMessage: '🍔 Sexta-feira é dia de Hambúrguer Artesanal! Não esqueça de reservar.',

        // System
        theme: 'light',
        language: 'pt-BR',

        // Profile
        managerName: 'Gerente Administrativo',
        managerEmail: 'gerente@empresa.com'
    })

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/admin/login')
            } else {
                setUser(user)
                // Overwrite with real user data if available
                setFormData(prev => ({
                    ...prev,
                    managerEmail: user.email || prev.managerEmail,
                    managerName: user.user_metadata?.name || prev.managerName
                }))
            }
        }
        checkAuth()
    }, [supabase, router])

    const handleSave = () => {
        setLoading(true)
        // Simulate API delay
        setTimeout(() => {
            setLoading(false)
            toast.success("Configurações salvas com sucesso!", {
                description: "As alterações foram aplicadas ao sistema.",
                icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
                style: {
                    background: 'var(--brand-cream)',
                    border: '1px solid var(--brand-primary)',
                    color: 'var(--brand-warm)'
                }
            })
        }, 800)
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-[var(--brand-cream)] p-6 pb-24 font-sans text-[var(--brand-warm)]">
            <Toaster position="bottom-right" />

            {/* Header */}
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <UtensilsCrossed className="w-6 h-6 text-[var(--brand-primary)]" />
                        Configurações da Cozinha
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Gerencie as regras operacionais e preferencias do sistema.</p>
                </div>
                <Button onClick={handleSave} disabled={loading} className="w-full md:w-auto shadow-md">
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
            </header>

            {/* Custom Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 border-b border-[var(--brand-primary)]/10 pb-1">
                <button
                    onClick={() => setActiveTab('unit')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all text-sm font-medium border-b-2 ${activeTab === 'unit'
                        ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] bg-[var(--brand-primary)]/5'
                        : 'border-transparent text-muted-foreground hover:text-[var(--brand-primary)] hover:bg-black/5'
                        }`}
                >
                    <Store className="w-4 h-4" /> Unidade & Operação
                </button>
                <button
                    onClick={() => setActiveTab('system')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all text-sm font-medium border-b-2 ${activeTab === 'system'
                        ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] bg-[var(--brand-primary)]/5'
                        : 'border-transparent text-muted-foreground hover:text-[var(--brand-primary)] hover:bg-black/5'
                        }`}
                >
                    <Palette className="w-4 h-4" /> Aparência & Sistema
                </button>
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all text-sm font-medium border-b-2 ${activeTab === 'profile'
                        ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] bg-[var(--brand-primary)]/5'
                        : 'border-transparent text-muted-foreground hover:text-[var(--brand-primary)] hover:bg-black/5'
                        }`}
                >
                    <Shield className="w-4 h-4" /> Perfil & Segurança
                </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-6 max-w-4xl mx-auto">

                {/* === TAB: UNIDADE & OPERAÇÃO === */}
                {activeTab === 'unit' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Dados da Cozinha */}
                        <Card className="border-none shadow-sm rounded-2xl">
                            <CardHeader className="border-b border-border/50 pb-4">
                                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[var(--brand-warm)]">
                                    <ChefHat className="w-5 h-5 text-[var(--brand-primary)]" />
                                    Dados da Cozinha
                                </CardTitle>
                                <CardDescription>Informações visíveis para os funcionários.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="unitName">Nome da Unidade</Label>
                                    <Input
                                        id="unitName"
                                        value={formData.unitName}
                                        onChange={(e) => setFormData({ ...formData, unitName: e.target.value })}
                                        className="bg-muted/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Telefone de Suporte</Label>
                                    <Input
                                        id="phone"
                                        value={formData.supportPhone}
                                        onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
                                        className="bg-muted/20"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="email">E-mail de Contato</Label>
                                    <Input
                                        id="email"
                                        value={formData.supportEmail}
                                        onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                                        className="bg-muted/20"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Regras Operacionais */}
                        <Card className="border-none shadow-sm rounded-2xl">
                            <CardHeader className="border-b border-border/50 pb-4">
                                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[var(--brand-warm)]">
                                    <Clock className="w-5 h-5 text-[var(--brand-accent)]" />
                                    Regras de Pedidos
                                </CardTitle>
                                <CardDescription>Defina os limites para realização de pedidos.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="cutoff">Horário Limite (Cut-off)</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="cutoff"
                                            type="time"
                                            value={formData.orderCutoff}
                                            onChange={(e) => setFormData({ ...formData, orderCutoff: e.target.value })}
                                            className="pl-9 bg-muted/20"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Hora máxima para solicitar almoço do dia.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Antecedência Mínima</Label>
                                    <Select
                                        value={formData.minNotice}
                                        onValueChange={(val) => setFormData({ ...formData, minNotice: val })}
                                    >
                                        <SelectTrigger className="bg-muted/20">
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="today">Mesmo dia (até cut-off)</SelectItem>
                                            <SelectItem value="24h">24h antes</SelectItem>
                                            <SelectItem value="48h">48h antes</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Aviso do Dia */}
                        <Card className="border-none shadow-sm rounded-2xl">
                            <CardHeader className="border-b border-border/50 pb-4">
                                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[var(--brand-warm)]">
                                    <Bell className="w-5 h-5 text-yellow-600" />
                                    Aviso do Dia
                                </CardTitle>
                                <CardDescription>Mensagem exibida no topo do painel dos funcionários.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <Label htmlFor="message">Mensagem Personalizada</Label>
                                    <Textarea
                                        id="message"
                                        rows={3}
                                        value={formData.dagMessage}
                                        onChange={(e) => setFormData({ ...formData, dagMessage: e.target.value })}
                                        className="bg-muted/20 resize-none"
                                        placeholder="Ex: Bom almoço a todos!"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* === TAB: APARÊNCIA & SISTEMA === */}
                {activeTab === 'system' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="border-none shadow-sm rounded-2xl">
                            <CardHeader className="border-b border-border/50 pb-4">
                                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[var(--brand-warm)]">
                                    <Globe className="w-5 h-5 text-blue-600" />
                                    Regionalização
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Idioma do Sistema</Label>
                                        <p className="text-sm text-muted-foreground">Defina o idioma padrão da interface admin.</p>
                                    </div>
                                    <Select
                                        value={formData.language}
                                        onValueChange={(val) => setFormData({ ...formData, language: val })}
                                    >
                                        <SelectTrigger className="w-[180px] bg-muted/20">
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                                            <SelectItem value="en-US">English (US)</SelectItem>
                                            <SelectItem value="es">Español</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm rounded-2xl">
                            <CardHeader className="border-b border-border/50 pb-4">
                                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[var(--brand-warm)]">
                                    <Palette className="w-5 h-5 text-purple-600" />
                                    Tema Visual
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="flex items-center justify-between pt-2">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Modo Escuro (Dark Mode)</Label>
                                        <p className="text-sm text-muted-foreground">Alternar entre tema claro e escuro.</p>
                                    </div>
                                    <Switch disabled checked={false} onCheckedChange={() => { }} />
                                </div>
                                <p className="text-xs text-muted-foreground italic">Opção gerenciada pelo sistema automaticamente por enquanto.</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* === TAB: PERFIL & SEGURANÇA === */}
                {activeTab === 'profile' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="border-none shadow-sm rounded-2xl">
                            <CardHeader className="border-b border-border/50 pb-4">
                                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[var(--brand-warm)]">
                                    <User className="w-5 h-5 text-[var(--brand-primary)]" />
                                    Dados do Usuário
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 grid gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="managerName">Nome Completo</Label>
                                    <Input
                                        id="managerName"
                                        value={formData.managerName}
                                        onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                                        className="bg-muted/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="managerEmail">E-mail Corporativo</Label>
                                    <Input
                                        id="managerEmail"
                                        value={formData.managerEmail}
                                        onChange={(e) => setFormData({ ...formData, managerEmail: e.target.value })}
                                        className="bg-muted/20"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm rounded-2xl border-l-4 border-l-red-500">
                            <CardHeader className="border-b border-border/50 pb-4">
                                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[var(--brand-warm)]">
                                    <Lock className="w-5 h-5 text-red-500" />
                                    Segurança
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h4 className="font-medium text-foreground">Redefinir Senha</h4>
                                    <p className="text-sm text-muted-foreground">Enviaremos um link de redefinição para seu e-mail.</p>
                                </div>
                                <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                                    Solicitar Troca de Senha
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
