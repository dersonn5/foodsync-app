'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, XCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ConfirmDialogVariant = 'danger' | 'warning' | 'success' | 'info'

interface ConfirmDialogProps {
    isOpen: boolean
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: ConfirmDialogVariant
    onConfirm: () => void
    onCancel: () => void
}

const variantConfig = {
    danger: {
        icon: XCircle,
        iconBg: 'bg-red-50',
        iconColor: 'text-red-500',
        confirmBg: 'bg-red-500 hover:bg-red-600 shadow-red-500/20',
        accentBar: 'bg-red-500',
    },
    warning: {
        icon: AlertTriangle,
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-500',
        confirmBg: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20',
        accentBar: 'bg-amber-500',
    },
    success: {
        icon: CheckCircle2,
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-500',
        confirmBg: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20',
        accentBar: 'bg-emerald-500',
    },
    info: {
        icon: AlertTriangle,
        iconBg: 'bg-brand-50',
        iconColor: 'text-brand-700',
        confirmBg: 'bg-brand-800 hover:bg-brand-900 shadow-brand-900/20',
        accentBar: 'bg-brand-800',
    },
}

export function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Voltar',
    variant = 'warning',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const config = variantConfig[variant]
    const Icon = config.icon

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                        onClick={onCancel}
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-[101] flex items-center justify-center p-6"
                    >
                        <div className="w-full max-w-[340px] bg-white rounded-3xl shadow-2xl overflow-hidden">
                            {/* Accent bar */}
                            <div className={`h-1.5 w-full ${config.accentBar}`} />

                            {/* Close button */}
                            <div className="flex justify-end px-4 pt-3">
                                <button
                                    onClick={onCancel}
                                    className="p-1.5 rounded-xl text-slate-300 hover:text-slate-500 hover:bg-slate-50 transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="px-8 pb-8 pt-2 text-center">
                                {/* Icon */}
                                <div className={`w-16 h-16 ${config.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm`}>
                                    <Icon className={`w-8 h-8 ${config.iconColor}`} />
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">
                                    {title}
                                </h3>
                                <p className="text-sm text-slate-500 leading-relaxed mb-8">
                                    {message}
                                </p>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <Button
                                        onClick={onCancel}
                                        variant="ghost"
                                        className="flex-1 h-12 bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 font-semibold rounded-xl active:scale-95 transition-all"
                                    >
                                        {cancelLabel}
                                    </Button>
                                    <Button
                                        onClick={onConfirm}
                                        className={`flex-1 h-12 text-white font-semibold rounded-xl shadow-lg active:scale-95 transition-all ${config.confirmBg}`}
                                    >
                                        {confirmLabel}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
