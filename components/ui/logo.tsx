import React from 'react';
import { cn } from '@/lib/utils';
import { ChefHat } from 'lucide-react';

interface LogoProps {
    className?: string;
    iconOnly?: boolean;
    variant?: 'light' | 'dark' | 'emerald';
}

export function Logo({ className, iconOnly = false, variant = 'emerald' }: LogoProps) {
    const isEmerald = variant === 'emerald';

    return (
        <div className={cn("flex items-center gap-3 select-none group", className)}>
            {/* Professional SVG Icon (No Container) */}
            <div className={cn(
                "transition-transform duration-300 group-hover:scale-110 shrink-0",
                isEmerald ? "text-emerald-600" : "text-white"
            )}>
                <ChefHat size={32} strokeWidth={2} />
            </div>

            {!iconOnly && (
                <div className="flex flex-col leading-tight pt-0.5">
                    <span
                        className={cn(
                            "text-2xl font-black italic tracking-tighter",
                            isEmerald ? "text-stone-800" : "text-white"
                        )}
                        style={{ fontFamily: 'Georgia, serif' }}
                    >
                        KitchenOS
                    </span>
                    <span
                        className={cn(
                            "text-[10px] uppercase tracking-[0.3em] font-black opacity-90",
                            isEmerald ? "text-stone-500" : "text-white/70"
                        )}
                    >
                        Gestão de Cozinha
                    </span>
                </div>
            )}
        </div>
    );
}
