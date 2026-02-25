'use client'

import React, { useState, useMemo } from 'react'
import { dishPhotos, DishPhoto } from '@/lib/dishPhotos'
import { Check, Image as ImageIcon, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface DishPhotoPickerProps {
    value: string | null
    onChange: (url: string) => void
    suggestedName?: string
}

export function DishPhotoPicker({ value, onChange, suggestedName = '' }: DishPhotoPickerProps) {
    const [searchTerm, setSearchTerm] = useState('')

    // Filter photos based on search term or suggested name
    const filteredPhotos = useMemo(() => {
        let photos = dishPhotos

        // If user is actively searching, use that
        if (searchTerm.trim()) {
            const query = searchTerm.toLowerCase()
            photos = photos.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.keywords.some(k => k.toLowerCase().includes(query)) ||
                p.category.includes(query)
            )
        }
        // Otherwise, if there is a suggested name (dish name typed in the form), auto-filter
        else if (suggestedName.trim() && suggestedName.length > 2) {
            const query = suggestedName.toLowerCase()

            // Prioritize keywords over just exact match
            const matched = photos.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.keywords.some(k => query.includes(k) || k.includes(query))
            )

            // If we found matches, show them first, then the rest
            if (matched.length > 0) {
                const unmatched = photos.filter(p => !matched.includes(p))
                photos = [...matched, ...unmatched]
            }
        }

        return photos
    }, [searchTerm, suggestedName])

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-brand-400" />
                    <Input
                        placeholder="Buscar foto (ex: frango, fit, lanche...)"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-9 h-9 text-xs bg-white/60 border-slate-200/60 focus-visible:ring-brand-800 focus-visible:border-brand-800"
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[180px] overflow-y-auto p-1 rounded-xl bg-slate-50 border border-slate-200/50 scrollbar-thin">
                {filteredPhotos.map((photo) => {
                    const isSelected = value === photo.src
                    return (
                        <div
                            key={photo.id}
                            onClick={() => onChange(photo.src)}
                            className={`
                                relative aspect-square rounded-xl overflow-hidden cursor-pointer group transition-all duration-200
                                ${isSelected ? 'ring-2 ring-brand-500 ring-offset-1 scale-95 shadow-md shadow-brand-500/20' : 'hover:ring-2 hover:ring-brand-300/50 hover:scale-[0.98] opacity-90 hover:opacity-100'}
                            `}
                        >
                            <img
                                src={photo.src}
                                alt={photo.name}
                                className="w-full h-full object-cover"
                            />

                            {/* Overlay gradient for text readability */}
                            <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`} />

                            {/* Selected Checkmark */}
                            {isSelected && (
                                <div className="absolute top-1.5 right-1.5 bg-brand-500 text-white rounded-full p-0.5 shadow-sm">
                                    <Check className="w-3 h-3" />
                                </div>
                            )}

                            {/* Name label */}
                            <div className={`absolute bottom-1 left-1.5 right-1.5 text-[9px] font-medium text-white leading-tight line-clamp-2 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                                {photo.name}
                            </div>
                        </div>
                    )
                })}
            </div>

            {!value && (
                <p className="text-[10px] text-amber-600 flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-md border border-amber-100 w-fit">
                    <ImageIcon className="w-3 h-3" /> Nenhum foto selecionada
                </p>
            )}
        </div>
    )
}
