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
    MoreHorizontal,
    Image as ImageIcon
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
        // Main Container: Fixed Height, No Window Scroll
        <div className="h-[calc(100vh-2rem)] flex flex-col p-6 max-w-[1800px] mx-auto font-sans overflow-hidden">
            <Toaster position="top-right" richColors />

            {/* Compact Header: Fixed */}
            <div className="flex-none flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
                        Planejamento Semanal
                    </h1>
                    <p className="text-slate-500 text-xs mt-1">
                        Gerencie o cardápio arrastando opções ou adicionando novos pratos.
                    </p>
                </div>

                <div className="bg-white shadow-sm border border-slate-200 rounded-full px-2 py-1.5 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigateWeek(-1)} className="hover:bg-slate-50 rounded-full w-8 h-8">
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </Button>

                    <div className="text-center min-w-[140px]">
                        <span className="block text-sm font-bold text-slate-900 uppercase tracking-wide">
                            {format(currentWeekStart, "dd MMM", { locale: ptBR })} - {format(addDays(currentWeekStart, 4), "dd MMM", { locale: ptBR })}
                        </span>
                    </div>

                    <Button variant="ghost" size="icon" onClick={() => navigateWeek(1)} className="hover:bg-slate-50 rounded-full w-8 h-8">
                        <ChevronRight className="w-5 h-5 text-slate-600" />
                    </Button>
                </div>
            </div>

            {/* Weekly Grid (Columns occupy remaining space) */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 min-h-0">
                {weekDays.map((date) => {
                    const dateStr = date.toISOString().split('T')[0]
                    const dayItems = itemsByDate[dateStr] || []
                    const isToday = isSameDay(date, new Date())

                    return (
                        // Individual Day Column: Flex Col + Internal Scroll
                        <div key={dateStr} className={`flex flex-col h-full rounded-2xl border transition-colors ${isToday ? 'bg-blue-50/50 border-blue-200/60 shadow-sm' : 'bg-slate-50/50 border-slate-200/60'}`}>

                            {/* Column Header */}
                            <div className="flex-none p-4 pb-2 text-center border-b border-white/50">
                                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] block mb-0.5 ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                                    {format(date, 'EEEE', { locale: ptBR }).split('-')[0]}
                                </span>
                                <span className={`text-2xl font-bold ${isToday ? 'text-blue-900' : 'text-slate-700'}`}>
                                    {format(date, 'dd')}
                                </span>
                            </div>

                            {/* Cards Stack (Scrollable) */}
                            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-3 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                                {loading ? (
                                    <div className="h-24 rounded-xl bg-white animate-pulse shadow-sm" />
                                ) : dayItems.map(item => (
                                    <Card key={item.id} className="group border shadow-sm border-slate-200/60 bg-white hover:shadow-md hover:border-green-500/30 transition-all duration-300 cursor-pointer overflow-hidden rounded-xl">
                                        <CardContent className="p-3">
                                            {/* Image & Actions */}
                                            <div className="relative h-20 rounded-lg overflow-hidden bg-slate-50 mb-3">
                                                {item.photo_url ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={item.photo_url} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-slate-300">
                                                        <Utensils className="w-6 h-6" />
                                                    </div>
                                                )}

                                                {/* Hover Actions */}
                                                <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <Button
                                                        size="icon"
                                                        className="h-6 w-6 bg-white/90 backdrop-blur-sm text-slate-700 hover:bg-white shadow-sm rounded-full"
                                                        onClick={(e) => { e.stopPropagation(); setEditingItem(item); setIsDialogOpen(true) }}
                                                    >
                                                        <Edit2 className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        className="h-6 w-6 bg-white/90 backdrop-blur-sm text-red-600 hover:bg-white hover:text-red-700 shadow-sm rounded-full"
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="space-y-1">
                                                <Badge variant="secondary" className={`
                                                    text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide border-0
                                                    ${item.type === 'main' ? 'bg-blue-50 text-blue-700' : item.type === 'fit' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}
                                                `}>
                                                    {item.type === 'main' ? 'Padrão' : item.type.toUpperCase()}
                                                </Badge>
                                                <h4 className="font-bold text-slate-800 text-xs leading-tight line-clamp-2">
                                                    {item.name}
                                                </h4>
                                                <p className="text-[10px] text-slate-400 line-clamp-1">
                                                    {item.description || "Sem descrição"}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Add Button (Fixed Footer in Column) */}
                            <div className="flex-none p-3 pt-0">
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setTargetDateForAdd(date)
                                        setIsDialogOpen(true)
                                    }}
                                    className="w-full border border-dashed border-slate-300 text-slate-400 hover:bg-white hover:border-green-400 hover:text-green-600 hover:shadow-sm rounded-xl h-10 text-xs transition-all"
                                >
                                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                                    Adicionar
                                </Button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Dialog Form */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
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
                                className="rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Tipo</Label>
                            <Select
                                onValueChange={(val) => setValue('type', val)}
                                defaultValue={editingItem?.type || 'main'}
                            >
                                <SelectTrigger className="rounded-xl">
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
                                className="rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>URL da Foto (Opcional)</Label>
                            <div className="relative">
                                <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    {...register('photo_url')}
                                    placeholder="https://..."
                                    className="pl-9 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-green-600 text-white hover:bg-green-700 rounded-xl">
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
