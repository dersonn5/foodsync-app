"use client"

import { useState } from "react"
import QRCode from "react-qr-code"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { ConfirmDialog } from "@/components/app/confirm-dialog"
import { toast } from "sonner"

// Definição segura dos dados
interface OrderTicketProps {
    isOpen: boolean
    onClose: () => void
    order: {
        id: string
        status: string
        consumption_date: string
        menu_items?: {
            name: string
            image_url?: string
        } | null
        short_id?: string
    } | null
    onOrderCanceled?: (orderId: string) => void
}

export function OrderTicketDialog({ isOpen, onClose, order, onOrderCanceled }: OrderTicketProps) {
    const [confirmOpen, setConfirmOpen] = useState(false)

    // Proteção contra crash
    if (!order) return null

    const dishName = order.menu_items?.name || "Prato não identificado"
    const dateFormatted = new Date(order.consumption_date).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    })

    // Check if order can be canceled (only confirmed orders, today or future)
    const consumptionDate = new Date(order.consumption_date + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const canCancel = order.status === 'confirmed' && consumptionDate >= today

    const executeCancel = async () => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: 'canceled' })
                .eq('id', order.id)
            if (error) throw error
            toast.success('Pedido cancelado com sucesso')
            onOrderCanceled?.(order.id)
            onClose()
        } catch (err) {
            toast.error('Erro ao cancelar pedido')
        }
    }

    const handleCancel = () => {
        setConfirmOpen(true)
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="w-[90%] rounded-3xl max-w-sm bg-white border-0 shadow-2xl">
                    <DialogHeader className="text-center">
                        <DialogTitle className="text-xl font-bold text-slate-800">
                            Seu Ticket
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Apresente este código na retirada
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col items-center gap-6 py-4">

                        {/* QR Code */}
                        <div className="p-8 bg-white rounded-2xl flex flex-col items-center">
                            <QRCode
                                value={order.short_id || order.id}
                                size={300}
                                fgColor="#000000"
                                bgColor="#ffffff"
                                level="L"
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                viewBox={`0 0 256 256`}
                            />
                            <p className="mt-2 text-2xl font-mono font-bold tracking-[0.2em] text-slate-900">
                                {order.short_id || order.id.slice(0, 8)}
                            </p>
                        </div>

                        {/* Dados do Pedido */}
                        <div className="text-center space-y-1">
                            <Badge variant="outline" className={`mb-2 px-3 py-1 ${order.status === 'confirmed'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : order.status === 'canceled'
                                    ? 'bg-red-50 text-red-600 border-red-200'
                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                }`}>
                                {order.status === 'confirmed' ? 'CONFIRMADO' : order.status === 'canceled' ? 'CANCELADO' : order.status.toUpperCase()}
                            </Badge>
                            <h3 className="font-bold text-lg text-slate-900 leading-tight px-4">
                                {dishName}
                            </h3>
                            <p className="text-sm text-slate-500 capitalize">
                                {dateFormatted}
                            </p>
                        </div>

                        <div className="w-full h-px bg-slate-100" />

                        <p className="text-[10px] text-slate-400 font-mono text-center w-full break-all px-4">
                            REF: {order.id}
                        </p>

                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                        <Button onClick={onClose} className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12">
                            Fechar Ticket
                        </Button>

                        {canCancel && (
                            <Button
                                onClick={handleCancel}
                                variant="ghost"
                                className="w-full h-10 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2"
                            >
                                <XCircle className="w-3.5 h-3.5" />
                                Cancelar este pedido
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Confirm Cancel Dialog */}
            <ConfirmDialog
                isOpen={confirmOpen}
                title="Cancelar pedido?"
                message="Seu pedido será cancelado. Você poderá fazer um novo pedido depois se desejar."
                confirmLabel="Sim, cancelar"
                cancelLabel="Voltar"
                variant="danger"
                onConfirm={() => { setConfirmOpen(false); executeCancel() }}
                onCancel={() => setConfirmOpen(false)}
            />
        </>
    )
}
