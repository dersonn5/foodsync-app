'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useForm } from 'react-hook-form'
import { Toaster, toast } from 'sonner'
import { format, addDays, startOfToday, subDays, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
    CalendarDays,
    Plus,
    ChevronLeft,
    ChevronRight,
    Edit2,
    Trash2,
    Utensils,
    Loader2,
    Save,
    X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

interface MenuItem {
    id: string
    name: string
    description: string | null
    type: 'main' | 'fit' | 'snack'
    date: string
    photo_url: string | null
}

export default function AdminMenuPage() {
    const supabase = createClient()
    const [selectedDate, setSelectedDate] = useState(startOfToday())
    const [items, setItems] = useState<MenuItem[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null)

    const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<any>()

    // Fetch items when date changes
    useEffect(() => {
        fetchItems()
    }, [selectedDate])

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (!isDialogOpen) {
            setEditingItem(null)
            reset({
                name: '',
                description: '',
                type: 'main',
                photo_url: ''
            })
        } else if (editingItem) {
            reset({
                name: editingItem.name,
                description: editingItem.description,
                type: editingItem.type,
                photo_url: editingItem.photo_url
            })
        }
    }, [isDialogOpen, editingItem, reset])

    async function fetchItems() {
        setLoading(true)
        const dateStr = selectedDate.toISOString().split('T')[0]

        try {
            const { data, error } = await supabase
                .from('menu_items')
                .select('*')
                .eq('date', dateStr)
                .order('created_at')

            if (error) throw error
            setItems(data || [])
        } catch (error) {
            console.error(error)
            toast.error('Erro ao carregar pratos')
        } finally {
            setLoading(false)
        }
    }

    const onSubmit = async (data: any) => {
        const dateStr = selectedDate.toISOString().split('T')[0]

        try {
            if (editingItem) {
                // Update
                const { error } = await supabase
                    .from('menu_items')
                    .update({ ...data })
                    .eq('id', editingItem.id)

                if (error) throw error
                toast.success('Prato atualizado!')
            } else {
                // Create
                const { error } = await supabase
                    .from('menu_items')
                    .insert({
                        ...data,
                        date: dateStr
                    })

                if (error) throw error
                toast.success('Prato criado!')
            }

            setIsDialogOpen(false)
            fetchItems()
        } catch (error) {
            console.error(error)
            toast.error('Erro ao salvar prato')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este prato?')) return

        try {
            const { error } = await supabase
                .from('menu_items')
                .delete()
                .eq('id', id)

            if (error) throw error
            toast.success('Prato excluído')
            fetchItems()
        } catch (error) {
            console.error(error)
            toast.error('Erro ao excluir')
        }
    }

    // Helper to change date
    const navigateDate = (days: number) => {
        setSelectedDate(prev => addDays(prev, days))
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <Toaster position="top-right" richColors />

            {/* Header / Date Navigation */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Utensils className="w-6 h-6 text-green-600" />
                        Cardápio Semanal
                    </h1>
                    <p className="text-slate-500 text-sm">Gerencie as refeições disponíveis por dia.</p>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <Button variant="ghost" size="icon" onClick={() => navigateDate(-1)}>
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </Button>

                    <div className="text-center min-w-[140px]">
                        <span className="block text-sm font-bold text-slate-900 uppercase tracking-wide">
                            {format(selectedDate, "EEEE", { locale: ptBR })}
                        </span>
                        <span className="text-xs text-slate-500">
                            {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                        </span>
                    </div>

                    <Button variant="ghost" size="icon" onClick={() => navigateDate(1)}>
                        <ChevronRight className="w-5 h-5 text-slate-600" />
                    </Button>
                </div>

                <Button
                    onClick={() => { setEditingItem(null); setIsDialogOpen(true) }}
                    className="bg-green-600 hover:bg-green-700 text-white gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Adicionar Prato
                </Button>
            </div>

            {/* Content Listing */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                    </div>
                ) : items.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map(item => (
                            <Card key={item.id} className="group hover:shadow-md transition-all border-slate-200">
                                <CardContent className="p-5 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className={`
                                            px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                            ${item.type === 'main' ? 'bg-blue-100 text-blue-700' :
                                                item.type === 'fit' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}
                                        `}>
                                            {item.type === 'main' ? 'Padrão' : item.type === 'fit' ? 'Fit/Saudável' : 'Lanche'}
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="ghost" onClick={() => { setEditingItem(item); setIsDialogOpen(true) }}>
                                                <Edit2 className="w-4 h-4 text-slate-500 hover:text-blue-500" />
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)}>
                                                <Trash2 className="w-4 h-4 text-slate-500 hover:text-red-500" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900 mb-1">{item.name}</h3>
                                        <p className="text-sm text-slate-500 line-clamp-2">
                                            {item.description || "Sem descrição."}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                        <CalendarDays className="w-16 h-16 mx-auto mb-4 text-slate-200" />
                        <h3 className="text-lg font-bold text-slate-400">Nenhum prato neste dia</h3>
                        <p className="text-slate-400 mb-6">Comece adicionando opções para o cardápio.</p>
                        <Button
                            variant="outline"
                            onClick={() => { setEditingItem(null); setIsDialogOpen(true) }}
                        >
                            Adicionar Prato Agora
                        </Button>
                    </div>
                )}
            </div>

            {/* Dialog Form */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Editar Prato' : 'Novo Prato'}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Nome do Prato</Label>
                            <Input
                                {...register('name', { required: true })}
                                placeholder="Ex: Strogonoff de Frango"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Tipo</Label>
                            <Select
                                onValueChange={(val) => setValue('type', val)}
                                defaultValue={editingItem?.type || 'main'}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="main">Padrão</SelectItem>
                                    <SelectItem value="fit">Fit / Saudável</SelectItem>
                                    <SelectItem value="snack">Lanche</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Descrição / Ingredientes</Label>
                            <Textarea
                                {...register('description')}
                                placeholder="Ex: Arroz, batata palha e salada..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>URL da Foto (Opcional)</Label>
                            <Input
                                {...register('photo_url')}
                                placeholder="https://..."
                            />
                        </div>

                        <div className="flex gap-2 justify-end pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-green-600 text-white hover:bg-green-700">
                                {isSubmitting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                Salvar
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
