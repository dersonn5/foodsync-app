import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
    className?: string;
    iconOnly?: boolean;
    variant?: 'light' | 'dark' | 'emerald';
}

export function Logo({ className, iconOnly = false, variant = 'emerald' }: LogoProps) {
    return (
        <div className={cn("flex items-center gap-3 select-none", className)}>
            {/* Chef Hat Icon SVG */}
            <div className={cn(
                "relative flex items-center justify-center shrink-0",
                variant === 'emerald' ? "text-emerald-500" : "text-white"
            )}>
                <svg
                    width="44"
                    height="44"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-sm"
                >
                    <path d="M6 13.8V16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2.2" />
                    <path d="M6 13h12" />
                    <path d="M6 10h12" />
                    <path d="M12 3c-4.97 0-9 2.01-9 4.5S5.03 12 10 12h4c4.97 0 7-2.01 7-4.5S16.97 3 12 3Z" />
                </svg>
            </div>

            {!iconOnly && (
                <div className="flex flex-col leading-tight">
                    <span
                        className={cn(
                            "text-2xl font-bold tracking-tight italic font-serif",
                            variant === 'emerald' ? "text-stone-800" : "text-white"
                        )}
                        style={{ fontFamily: 'Georgia, serif' }}
                    >
                        KitchenOS
                    </span>
                    <span
                        className={cn(
                            "text-[10px] uppercase tracking-[0.2em] font-bold opacity-70",
                            variant === 'emerald' ? "text-stone-500" : "text-white/70"
                        )}
                    >
                        Gestão de Cozinha
                    </span>
                </div>
            )}
        </div>
    );
}
