"use client"

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
import { Download } from "lucide-react"
import { useRef } from "react"

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
        short_id?: string // [NOVO] Suporte a Short ID
    } | null
}

export function OrderTicketDialog({ isOpen, onClose, order }: OrderTicketProps) {
    // Proteção contra crash: Se não tiver pedido, não renderiza nada
    if (!order) return null

    // Normaliza os dados para evitar erro de "undefined"
    const dishName = order.menu_items?.name || "Prato não identificado"
    const dateFormatted = new Date(order.consumption_date).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    })

    return (
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

                    {/* O QR CODE OTIMIZADO */}
                    <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-slate-200 shadow-sm flex flex-col items-center">
                        <QRCode
                            value={order.short_id || order.id}
                            size={240}
                            fgColor="#000000"
                            bgColor="#ffffff"
                            level="L"
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            viewBox={`0 0 256 256`}
                        />
                        {/* Exibe o código humanamente legível em baixo */}
                        <p className="mt-2 text-2xl font-mono font-bold tracking-[0.2em] text-slate-900">
                            {order.short_id}
                        </p>
                    </div>

                    {/* Dados do Pedido */}
                    <div className="text-center space-y-1">
                        <Badge variant="outline" className="mb-2 bg-green-50 text-green-700 border-green-200 px-3 py-1">
                            {order.status === 'confirmed' ? 'CONFIRMADO' : order.status}
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
                        ID: {order.id}
                    </p>

                </div>

                {/* Botão de Fechar */}
                <Button onClick={onClose} className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12">
                    Fechar Ticket
                </Button>
            </DialogContent>
        </Dialog>
    )
}
