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
    Coffee,
    X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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

    // Auto-Scroll to Today on Mount (horizontal only, no vertical scroll)
    useEffect(() => {
        const dayOfWeek = new Date().getDay()
        const todayIndex = dayOfWeek - 1 // Mon(1) -> 0, Fri(5) -> 4

        if (todayIndex >= 0 && todayIndex <= 4) {
            const currentDayElement = dayRefs.current[todayIndex];
            setTimeout(() => {
                if (currentDayElement) {
                    // Only scroll horizontally on mobile (when using flex scroll)
                    const parent = currentDayElement.parentElement;
                    if (parent && window.innerWidth < 768) {
                        const scrollLeft = currentDayElement.offsetLeft - parent.offsetLeft - 16;
                        parent.scrollTo({ left: scrollLeft, behavior: 'smooth' });
                    }
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
        <div className="h-[calc(100vh-2rem)] flex flex-col p-6 md:p-8 w-full font-sans overflow-hidden bg-transparent">
            <Toaster position="top-right" richColors />

            {/* Header */}
            <div className="flex-none flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3 tracking-tight" style={{ color: '#0F2A1D' }}>
                        <div className="p-2 rounded-xl shadow-lg" style={{ backgroundColor: '#0F2A1D' }}>
                            <ChefHat className="w-6 h-6 text-white" />
                        </div>
                        Planejamento de Cardápio
                    </h1>
                    <p className="text-sm mt-1.5 ml-[52px]" style={{ color: '#517252' }}>
                        Organize a excelência gastronômica da semana
                    </p>
                </div>

                {/* Week Navigation - Glassmorphism */}
                <div className="bg-white/60 backdrop-blur-xl shadow-sm border border-slate-200/60 rounded-2xl px-3 py-2 hidden md:flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigateWeek(-1)}
                        className="hover:bg-white/60 text-brand-600 hover:text-brand-900 rounded-xl w-9 h-9 transition-all"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>

                    <div className="text-center min-w-[160px] px-2">
                        <span className="block text-sm font-semibold text-brand-900 tracking-wide">
                            {format(currentWeekStart, "dd MMM", { locale: ptBR })} — {format(addDays(currentWeekStart, 4), "dd MMM", { locale: ptBR })}
                        </span>
                        <span className="text-[10px] text-brand-600 uppercase tracking-wider">
                            Semana {format(currentWeekStart, "w", { locale: ptBR })}
                        </span>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigateWeek(1)}
                        className="hover:bg-white/60 text-brand-600 hover:text-brand-900 rounded-xl w-9 h-9 transition-all"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Pipeline Grid - Fixed scrollbar clipping with proper padding */}
            <div className="flex-1 min-h-0 flex flex-row overflow-x-auto snap-x snap-mandatory gap-4 px-2 pb-4 pt-2 md:px-0 md:pb-2 md:grid md:grid-cols-5 md:gap-5 hide-scrollbar">
                {weekDays.map((date, index) => {
                    const dateStr = date.toISOString().split('T')[0]
                    const dayItems = itemsByDate[dateStr] || []
                    const isToday = isSameDay(date, new Date())
                    const isLastColumn = index === 4

                    return (
                        <div
                            key={dateStr}
                            ref={(el) => { dayRefs.current[index] = el }}
                            className={`
                                flex flex-col h-[97%] my-auto rounded-2xl transition-all duration-300 overflow-hidden shrink-0 min-w-[280px] snap-center md:min-w-0 md:w-auto md:shrink relative
                                ${isLastColumn ? 'md:mr-4' : ''}
                                ${isToday
                                    ? 'bg-white/80 backdrop-blur-2xl shadow-lg shadow-brand-800/10 border-2 border-brand-400/50'
                                    : 'bg-white/60 backdrop-blur-xl hover:bg-white/70 border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300'
                                }
                            `}
                        >
                            {/* Day Header - Clean & Minimal */}
                            <div className={`
                                flex-none px-4 py-3 flex items-center justify-between
                                ${isToday
                                    ? 'bg-brand-50/70 border-b border-brand-200/50'
                                    : 'bg-white/40 border-b border-slate-200/60'
                                }
                            `}>
                                <div className="flex items-center gap-3">
                                    <div className={`
                                        w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg
                                        ${isToday
                                            ? 'bg-gradient-to-br from-brand-800 to-brand-700 text-white shadow-md shadow-brand-900/30'
                                            : 'bg-white text-brand-600 shadow-sm border border-slate-200/60'
                                        }
                                    `}>
                                        {format(date, 'dd')}
                                    </div>
                                    <div>
                                        <span className={`block text-xs font-medium uppercase tracking-wider ${isToday ? 'text-brand-900' : 'text-brand-600'}`}>
                                            {format(date, 'EEEE', { locale: ptBR }).split('-')[0]}
                                        </span>
                                        <span className={`block text-[10px] ${isToday ? 'text-brand-600' : 'text-brand-400'}`}>
                                            {format(date, 'MMM yyyy', { locale: ptBR })}
                                        </span>
                                    </div>
                                </div>
                                {isToday && (
                                    <span className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider bg-brand-800 text-white rounded-md shadow-sm">
                                        Hoje
                                    </span>
                                )}
                            </div>

                            {/* Cards Container */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-brand-100 scrollbar-track-transparent">
                                {loading ? (
                                    <div className="space-y-3">
                                        <div className="h-28 rounded-xl bg-white/50 animate-pulse border border-slate-200/60" />
                                        <div className="h-28 rounded-xl bg-white/50 animate-pulse delay-75 border border-slate-200/60" />
                                    </div>
                                ) : (
                                    <>
                                        {dayItems.map(item => (
                                            <Card
                                                key={item.id}
                                                className="group border border-slate-200/60 bg-white/80 backdrop-blur-md shadow-sm hover:shadow-md hover:border-slate-300 hover:bg-white hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden rounded-xl"
                                            >
                                                <CardContent className="p-0">
                                                    {/* Image Area */}
                                                    <div className="relative h-24 bg-gradient-to-br from-slate-100/50 to-white/50 overflow-hidden">
                                                        {item.photo_url ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={item.photo_url} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center">
                                                                <Utensils className="w-8 h-8 text-stone-300" />
                                                            </div>
                                                        )}

                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                                                        {/* Type Badge - Subtle */}
                                                        <div className={`
                                                            absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-medium backdrop-blur-sm shadow-sm
                                                            ${item.type === 'main'
                                                                ? 'bg-white/90 text-brand-900 border border-slate-200/50'
                                                                : item.type === 'fit'
                                                                    ? 'bg-brand-800/90 text-white'
                                                                    : 'bg-amber-600/90 text-white'
                                                            }
                                                        `}>
                                                            {item.type === 'main' ? '● Padrão' : item.type === 'fit' ? '◆ Fit' : '○ Lanche'}
                                                        </div>

                                                        {/* Actions Overlay */}
                                                        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                                                            <Button
                                                                size="icon"
                                                                className="h-7 w-7 bg-white/90 backdrop-blur-md text-brand-600 hover:bg-brand-800 hover:text-white shadow-sm border border-slate-200/60 rounded-lg transition-all"
                                                                onClick={(e) => { e.stopPropagation(); setEditingItem(item); setIsDialogOpen(true) }}
                                                            >
                                                                <Edit2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                className="h-7 w-7 bg-white/90 backdrop-blur-md text-red-400 hover:bg-red-500 hover:text-white shadow-sm border border-slate-200/60 rounded-lg transition-all"
                                                                onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }}
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="p-3">
                                                        <h4 className="font-semibold text-brand-900 text-sm leading-tight mb-1 line-clamp-1">
                                                            {item.name}
                                                        </h4>
                                                        <p className="text-[11px] text-brand-600 line-clamp-2 leading-relaxed">
                                                            {item.description || "Sem descrição disponível"}
                                                        </p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}

                                        {/* Add Button - Refined */}
                                        <button
                                            onClick={() => {
                                                setTargetDateForAdd(date)
                                                setIsDialogOpen(true)
                                            }}
                                            className="w-full py-4 border-2 border-dashed border-slate-200/80 bg-white/40 backdrop-blur-sm rounded-xl flex items-center justify-center text-brand-400 hover:text-brand-900 hover:bg-white/70 hover:border-brand-400 transition-all cursor-pointer gap-2 group shadow-sm"
                                        >
                                            <div className="w-7 h-7 rounded-lg bg-white group-hover:bg-brand-50 flex items-center justify-center shadow-sm border border-slate-200/50 transition-all group-hover:scale-110">
                                                <Plus className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-medium">Adicionar prato</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Dialog Form - Premium Styling */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[480px] bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/80 shadow-2xl z-[100] p-0 overflow-hidden">
                    {/* Header with subtle gradient */}
                    <div className="bg-gradient-to-r from-white/60 to-brand-50/30 px-6 py-4 border-b border-slate-200/60">
                        <DialogHeader className="p-0">
                            <DialogTitle className="text-lg font-semibold text-brand-900 flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${editingItem ? 'bg-amber-100/80 border border-amber-200/50' : 'bg-brand-100/50 border border-brand-200/50'}`}>
                                    {editingItem
                                        ? <Edit2 className="w-4 h-4 text-amber-600" />
                                        : <Plus className="w-4 h-4 text-brand-800" />
                                    }
                                </div>
                                {editingItem ? 'Editar Prato' : 'Adicionar ao Menu'}
                            </DialogTitle>
                        </DialogHeader>
                    </div>

                    <div className="px-6 py-5">
                        {targetDateForAdd && !editingItem && (
                            <div className="pb-4 mb-4 border-b border-slate-100/50">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50/50 text-brand-800 rounded-lg border border-brand-100/50 text-sm font-medium">
                                    <CalendarDays className="w-4 h-4 text-brand-600" />
                                    {format(targetDateForAdd, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div className="space-y-1.5">
                                <Label className="text-brand-900 font-medium text-sm">Nome do Prato</Label>
                                <Input
                                    {...register('name', { required: true })}
                                    placeholder="Ex: Risoto de Funghi"
                                    className="rounded-lg border-slate-200/60 focus-visible:ring-brand-800 focus-visible:border-brand-800 bg-white/60 h-11 text-brand-900"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-brand-900 font-medium text-sm">Categoria</Label>
                                    <Select
                                        onValueChange={(val) => setValue('type', val)}
                                        defaultValue={editingItem?.type || 'main'}
                                    >
                                        <SelectTrigger className="rounded-lg border-slate-200/60 bg-white/60 h-11 focus:ring-brand-800 text-brand-900">
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="main">
                                                <div className="flex items-center gap-2">
                                                    <Utensils className="w-4 h-4 text-brand-400" /> Padrão
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="fit">
                                                <div className="flex items-center gap-2">
                                                    <Leaf className="w-4 h-4 text-brand-800" /> Fit / Saudável
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="snack">
                                                <div className="flex items-center gap-2">
                                                    <Coffee className="w-4 h-4 text-amber-500" /> Lanche
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-brand-900 font-medium text-sm">Foto URL</Label>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-3 top-3.5 h-4 w-4 text-brand-400" />
                                        <Input
                                            {...register('photo_url')}
                                            placeholder="https://..."
                                            className="pl-9 rounded-lg border-slate-200/60 bg-white/60 focus-visible:ring-brand-800 focus-visible:border-brand-800 h-11 text-brand-900"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-brand-900 font-medium text-sm">Ingredientes / Descrição</Label>
                                <Textarea
                                    {...register('description')}
                                    placeholder="Descreva os ingredientes principais..."
                                    className="rounded-lg border-slate-200/60 bg-white/60 min-h-[100px] resize-none focus-visible:ring-brand-800 focus-visible:border-brand-800 text-brand-900"
                                />
                            </div>

                            <DialogFooter className="pt-4 gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsDialogOpen(false)}
                                    className="rounded-lg text-brand-600 hover:text-brand-900 hover:bg-white/60"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="rounded-lg bg-brand-800 hover:bg-brand-900 text-white shadow-md shadow-brand-900/20"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Salvar Prato
                                </Button>
                            </DialogFooter>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
