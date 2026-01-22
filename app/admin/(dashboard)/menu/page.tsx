'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useForm } from 'react-hook-form'
import { Toaster, toast } from 'sonner'
import { format, addDays, startOfWeek, endOfWeek, isSameDay, subWeeks, addWeeks, startOfToday } from 'date-fns'
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
    MoreHorizontal
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

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
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
    const [items, setItems] = useState<MenuItem[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
    const [targetDateForAdd, setTargetDateForAdd] = useState<Date | null>(null)

    const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm<any>()

    // Fetch items when week changes
    useEffect(() => {
        fetchWeekItems()
    }, [currentWeekStart])

    // Reset form
    useEffect(() => {
        if (!isDialogOpen) {
            setEditingItem(null)
            setTargetDateForAdd(null)
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

    async function fetchWeekItems() {
        setLoading(true)
        const startStr = currentWeekStart.toISOString().split('T')[0]
        const endStr = addDays(currentWeekStart, 6).toISOString().split('T')[0]

        try {
            const { data, error } = await supabase
                .from('menu_items')
                .select('*')
                .gte('date', startStr)
                .lte('date', endStr)
                .order('created_at')

            if (error) throw error
            setItems(data || [])
        } catch (error) {
            console.error(error)
            toast.error('Erro ao carregar cardápio')
        } finally {
            setLoading(false)
        }
    }

    const onSubmit = async (data: any) => {
        // Determine date: either from editing item or the target column
        let dateStr = ''
        if (editingItem) {
            dateStr = editingItem.date
        } else if (targetDateForAdd) {
            dateStr = targetDateForAdd.toISOString().split('T')[0]
        } else {
            // Fallback (shouldn't happen with UI flow)
            dateStr = new Date().toISOString().split('T')[0]
        }

        try {
            if (editingItem) {
                const { error } = await supabase
                    .from('menu_items')
                    .update({ ...data })
                    .eq('id', editingItem.id)
                if (error) throw error
                toast.success('Prato atualizado!')
            } else {
                const { error } = await supabase
                    .from('menu_items')
                    .insert({
                        ...data,
                        date: dateStr
                    })
                if (error) throw error
                toast.success('Prato adicionado!')
            }

            setIsDialogOpen(false)
            fetchWeekItems()
        } catch (error) {
            console.error(error)
            toast.error('Erro ao salvar')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir este prato?')) return
        try {
            const { error } = await supabase.from('menu_items').delete().eq('id', id)
            if (error) throw error
            toast.success('Prato removido')
            fetchWeekItems()
        } catch (error) {
            toast.error('Erro ao excluir')
        }
    }

    const navigateWeek = (dir: 1 | -1) => {
        setCurrentWeekStart(prev => dir === 1 ? addWeeks(prev, 1) : subWeeks(prev, 1))
    }

    // Generate Mon-Fri columns
    const weekDays = Array.from({ length: 5 }).map((_, i) => addDays(currentWeekStart, i))

    // Group items by date string
    const itemsByDate = items.reduce((acc, item) => {
        const d = item.date
        if (!acc[d]) acc[d] = []
        acc[d].push(item)
        return acc
    }, {} as Record<string, MenuItem[]>)

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            <Toaster position="top-right" richColors />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-[0_2px_15px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <div className="p-2 bg-green-50 rounded-xl text-green-600">
                            <Utensils className="w-6 h-6" />
                        </div>
                        Planejamento Semanal
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 ml-14">Organize o cardápio arrastando opções (em breve) ou editando as colunas.</p>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                    <Button variant="ghost" size="icon" onClick={() => navigateWeek(-1)} className="hover:bg-white rounded-xl">
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </Button>

                    <div className="text-center min-w-[200px]">
                        <span className="block text-sm font-bold text-slate-900 uppercase tracking-wide">
                            {format(currentWeekStart, "dd MMM", { locale: ptBR })} - {format(addDays(currentWeekStart, 4), "dd MMM", { locale: ptBR })}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            Semana Atual
                        </span>
                    </div>

                    <Button variant="ghost" size="icon" onClick={() => navigateWeek(1)} className="hover:bg-white rounded-xl">
                        <ChevronRight className="w-5 h-5 text-slate-600" />
                    </Button>
                </div>
            </div>

            {/* Weekly Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {weekDays.map((date) => {
                    const dateStr = date.toISOString().split('T')[0]
                    const dayItems = itemsByDate[dateStr] || []
                    const isToday = isSameDay(date, new Date())

                    return (
                        <div key={dateStr} className={`flex flex-col gap-4 rounded-3xl p-4 min-h-[500px] transition-colors ${isToday ? 'bg-blue-50/50 border-2 border-blue-100/50' : 'bg-gray-50/50 border border-gray-100'}`}>
                            {/* Column Header */}
                            <div className="flex items-center justify-between pb-2 border-b border-black/5 mx-1">
                                <div>
                                    <span className={`text-xs font-bold uppercase tracking-wider block ${isToday ? 'text-blue-600' : 'text-gray-400'}`}>
                                        {format(date, 'EEEE', { locale: ptBR }).split('-')[0]}
                                    </span>
                                    <span className={`text-xl font-bold ${isToday ? 'text-blue-900' : 'text-gray-700'}`}>
                                        {format(date, 'dd')}
                                    </span>
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 rounded-full hover:bg-black/5"
                                    onClick={() => {
                                        setTargetDateForAdd(date)
                                        setIsDialogOpen(true)
                                    }}
                                >
                                    <Plus className="w-4 h-4 text-gray-500" />
                                </Button>
                            </div>

                            {/* Cards Stack */}
                            <div className="flex-1 space-y-3">
                                {loading ? (
                                    <div className="h-24 rounded-2xl bg-white/50 animate-pulse" />
                                ) : dayItems.length > 0 ? (
                                    dayItems.map(item => (
                                        <Card key={item.id} className="border-0 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden bg-white">
                                            <CardContent className="p-3">
                                                <div className="flex justify-between items-start mb-2">
                                                    <Badge variant="secondary" className={`
                                                        text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide border-0
                                                        ${item.type === 'main' ? 'bg-blue-50 text-blue-700' : item.type === 'fit' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}
                                                    `}>
                                                        {item.type === 'main' ? 'Padrão' : item.type.toUpperCase()}
                                                    </Badge>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1 -mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => { setEditingItem(item); setIsDialogOpen(true) }}>
                                                                <Edit2 className="w-4 h-4 mr-2" /> Editar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-red-600">
                                                                <Trash2 className="w-4 h-4 mr-2" /> Excluir
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>

                                                <div className="flex gap-3 items-center">
                                                    <div className="h-10 w-10 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                                                        {item.photo_url ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={item.photo_url} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center text-gray-300">
                                                                <Utensils className="w-5 h-5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-gray-900 truncate leading-tight">{item.name}</p>
                                                        <p className="text-[10px] text-gray-400 truncate mt-0.5">{item.description || 'Sem descrição'}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="h-full border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:border-green-300 hover:bg-green-50/30 transition-all group"
                                        onClick={() => {
                                            setTargetDateForAdd(date)
                                            setIsDialogOpen(true)
                                        }}
                                    >
                                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-green-100 group-hover:text-green-600 transition-colors mb-2">
                                            <Plus className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 group-hover:text-green-700">Adicionar Prato</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Dialog Form */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Editar Prato' : 'Adicionar ao Cardápio'}</DialogTitle>
                    </DialogHeader>

                    {targetDateForAdd && !editingItem && (
                        <div className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg mb-2">
                            Adicionando para: {format(targetDateForAdd, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                        </div>
                    )}

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
