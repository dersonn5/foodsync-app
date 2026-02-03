'use client'

import { useState, useEffect, useRef } from 'react'
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
    Image as ImageIcon,
    ChefHat,
    Leaf,
    Coffee
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

    // Day Refs for Auto-Scroll
    const dayRefs = useRef<(HTMLDivElement | null)[]>([])

    const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm<any>()

    // Fetch items when week changes
    useEffect(() => {
        fetchWeekItems()
    }, [currentWeekStart])

    // Auto-Scroll to Today on Mount
    useEffect(() => {
        const dayOfWeek = new Date().getDay()
        const todayIndex = dayOfWeek - 1 // Mon(1) -> 0, Fri(5) -> 4

        if (todayIndex >= 0 && todayIndex <= 4) {
            const currentDayElement = dayRefs.current[todayIndex];
            setTimeout(() => {
                if (currentDayElement) {
                    currentDayElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'center'
                    });
                }
            }, 100)
        }
    }, [])

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

    const weekDays = Array.from({ length: 5 }).map((_, i) => addDays(currentWeekStart, i))

    const itemsByDate = items.reduce((acc, item) => {
        const d = item.date
        if (!acc[d]) acc[d] = []
        acc[d].push(item)
        return acc
    }, {} as Record<string, MenuItem[]>)

    return (
        // Main Container: Cream Background
        <div className="h-[calc(100vh-2rem)] flex flex-col px-6 py-4 w-full font-sans overflow-hidden bg-[var(--brand-cream)] text-[var(--brand-warm)]">
            <Toaster position="top-right" richColors />

            {/* Header */}
            <div className="flex-none flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3 tracking-tight text-[var(--brand-warm)]">
                        <ChefHat className="w-8 h-8 text-[var(--brand-primary)]" />
                        Planejamento de Cardápio
                    </h1>
                    <p className="text-[var(--brand-warm)]/70 text-sm mt-1">
                        Organize a excelência gastronômica da semana.
                    </p>
                </div>

                <div className="bg-white shadow-sm border border-[var(--brand-primary)]/20 rounded-full px-2 py-1.5 hidden md:flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigateWeek(-1)} className="hover:bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-full w-8 h-8">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>

                    <div className="text-center min-w-[140px]">
                        <span className="block text-sm font-bold text-[var(--brand-warm)] uppercase tracking-wide">
                            {format(currentWeekStart, "dd MMM", { locale: ptBR })} - {format(addDays(currentWeekStart, 4), "dd MMM", { locale: ptBR })}
                        </span>
                    </div>

                    <Button variant="ghost" size="icon" onClick={() => navigateWeek(1)} className="hover:bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-full w-8 h-8">
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Pipeline Grid */}
            <div className="flex-1 min-h-0 flex flex-row overflow-x-auto snap-x snap-mandatory gap-4 px-4 pb-4 md:px-0 md:pb-0 md:grid md:grid-cols-5 md:gap-4 hide-scrollbar">
                {weekDays.map((date, index) => {
                    const dateStr = date.toISOString().split('T')[0]
                    const dayItems = itemsByDate[dateStr] || []
                    const isToday = isSameDay(date, new Date())

                    return (
                        <div
                            key={dateStr}
                            ref={(el) => { dayRefs.current[index] = el }}
                            className={`
                                flex flex-col h-full rounded-3xl transition-all duration-300 overflow-hidden shrink-0 min-w-[85vw] snap-center md:min-w-0 md:w-auto md:shrink relative
                                ${isToday
                                    ? 'bg-white ring-2 ring-[var(--brand-primary)] shadow-md z-10'
                                    : 'bg-white/60 hover:bg-white border border-[var(--brand-primary)]/10'}
                            `}
                        >
                            {/* Day Header */}
                            <div className={`
                                flex-none p-4 border-b flex items-center justify-between
                                ${isToday ? 'border-[var(--brand-primary)]/20 bg-[var(--brand-primary)]/5' : 'border-[var(--brand-primary)]/5'}
                            `}>
                                <div className="flex flex-col">
                                    <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isToday ? 'text-[var(--brand-primary)]' : 'text-stone-400'}`}>
                                        {format(date, 'EEEE', { locale: ptBR }).split('-')[0]}
                                    </span>
                                    <span className={`text-xl font-bold font-serif ${isToday ? 'text-[var(--brand-primary)]' : 'text-[var(--brand-warm)]'}`}>
                                        {format(date, 'dd')}
                                    </span>
                                </div>
                                {isToday && <Badge className="bg-[var(--brand-primary)] text-white text-[10px] h-5">HOJE</Badge>}
                            </div>

                            {/* Cards Container */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-[var(--brand-primary)]/20 scrollbar-track-transparent">
                                {loading ? (
                                    <div className="space-y-3">
                                        <div className="h-24 rounded-2xl bg-stone-100 animate-pulse" />
                                        <div className="h-24 rounded-2xl bg-stone-100 animate-pulse delay-75" />
                                    </div>
                                ) : (
                                    <>
                                        {dayItems.map(item => (
                                            <Card key={item.id} className="group border-0 shadow-sm bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden rounded-2xl">
                                                <CardContent className="p-0">
                                                    {/* Image Area */}
                                                    <div className="relative h-24 bg-stone-100 overflow-hidden">
                                                        {item.photo_url ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={item.photo_url} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center text-[var(--brand-primary)]/20">
                                                                <Utensils className="w-8 h-8" />
                                                            </div>
                                                        )}

                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

                                                        {/* Badge */}
                                                        <Badge className={`
                                                            absolute bottom-2 left-2 border-0 backdrop-blur-md bg-white/20 text-white font-medium shadow-sm
                                                        `}>
                                                            {item.type === 'main' ? 'Padrão' : item.type === 'fit' ? 'Fit' : 'Lanche'}
                                                        </Badge>

                                                        {/* Actions Overlay */}
                                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                                            <Button
                                                                size="icon"
                                                                className="h-7 w-7 bg-white text-stone-700 hover:bg-[var(--brand-primary)] hover:text-white shadow-sm rounded-full"
                                                                onClick={(e) => { e.stopPropagation(); setEditingItem(item); setIsDialogOpen(true) }}
                                                            >
                                                                <Edit2 className="w-3 h-3" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                className="h-7 w-7 bg-white text-red-500 hover:bg-red-500 hover:text-white shadow-sm rounded-full"
                                                                onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }}
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="p-3">
                                                        <h4 className="font-bold text-[var(--brand-warm)] text-sm leading-tight mb-1 line-clamp-2">
                                                            {item.name}
                                                        </h4>
                                                        <p className="text-[10px] text-[var(--brand-warm)]/60 line-clamp-2 leading-relaxed">
                                                            {item.description || "Sem ingredientes listados."}
                                                        </p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}

                                        {/* Add Button */}
                                        <button
                                            onClick={() => {
                                                setTargetDateForAdd(date)
                                                setIsDialogOpen(true)
                                            }}
                                            className="w-full py-4 border-2 border-dashed border-[var(--brand-primary)]/20 rounded-2xl flex items-center justify-center text-[var(--brand-primary)]/60 hover:text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5 hover:border-[var(--brand-primary)]/50 transition-all cursor-pointer gap-2 group"
                                        >
                                            <div className="w-6 h-6 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Plus className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-semibold uppercase tracking-wide">Adicionar</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Dialog Form */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden bg-[var(--brand-cream)] border-[var(--brand-primary)]/20">
                    <DialogHeader className="p-6 pb-2 bg-white">
                        <DialogTitle className="text-xl font-bold text-[var(--brand-warm)] flex items-center gap-2">
                            {editingItem ? <Edit2 className="w-5 h-5 text-[var(--brand-primary)]" /> : <Plus className="w-5 h-5 text-[var(--brand-primary)]" />}
                            {editingItem ? 'Editar Prato' : 'Adicionar ao Menu'}
                        </DialogTitle>
                    </DialogHeader>

                    {targetDateForAdd && !editingItem && (
                        <div className="px-6 pb-4 bg-white border-b border-[var(--brand-primary)]/10">
                            <Badge variant="outline" className="bg-[var(--brand-primary)]/5 text-[var(--brand-primary)] border-[var(--brand-primary)]/20">
                                <CalendarDays className="w-3 h-3 mr-1" />
                                {format(targetDateForAdd, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                            </Badge>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">

                        <div className="space-y-2">
                            <Label className="text-[var(--brand-warm)] font-semibold">Nome do Prato</Label>
                            <Input
                                {...register('name', { required: true })}
                                placeholder="Ex: Risoto de Funghi"
                                className="rounded-xl border-[var(--brand-primary)]/20 focus-visible:ring-[var(--brand-primary)] bg-white"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[var(--brand-warm)] font-semibold">Categoria</Label>
                                <Select
                                    onValueChange={(val) => setValue('type', val)}
                                    defaultValue={editingItem?.type || 'main'}
                                >
                                    <SelectTrigger className="rounded-xl border-[var(--brand-primary)]/20 bg-white">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="main">
                                            <div className="flex items-center gap-2">
                                                <Utensils className="w-4 h-4 text-blue-500" /> Padrão
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="fit">
                                            <div className="flex items-center gap-2">
                                                <Leaf className="w-4 h-4 text-green-500" /> Fit / Saudável
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="snack">
                                            <div className="flex items-center gap-2">
                                                <Coffee className="w-4 h-4 text-orange-500" /> Lanche
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[var(--brand-warm)] font-semibold">Foto URL</Label>
                                <div className="relative">
                                    <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-[var(--brand-primary)]/40" />
                                    <Input
                                        {...register('photo_url')}
                                        placeholder="https://..."
                                        className="pl-9 rounded-xl border-[var(--brand-primary)]/20 bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[var(--brand-warm)] font-semibold">Ingredientes / Descrição</Label>
                            <Textarea
                                {...register('description')}
                                placeholder="Descreva os ingredientes principais..."
                                className="rounded-xl border-[var(--brand-primary)]/20 bg-white min-h-[80px]"
                            />
                        </div>

                        <div className="flex gap-3 justify-end pt-2">
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl text-[var(--brand-warm)] hover:bg-[var(--brand-primary)]/10">
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-white shadow-md">
                                {isSubmitting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                Salvar Prato
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
