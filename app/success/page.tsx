'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import QRCode from 'react-qr-code'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, Home } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function SuccessContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const orderId = searchParams.get('orderId')
    const itemName = searchParams.get('itemName')
    const tomorrow = addDays(new Date(), 1)

    if (!orderId) {
        return (
            <div className="text-center text-slate-500">
                <p>Pedido não encontrado.</p>
                <Link href="/selection" className="text-green-600 underline">Voltar</Link>
            </div>
        )
    }

    return (
        <div className="w-full max-w-md space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-4">
                <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <h1 className="text-3xl font-extrabold text-green-800">Pedido Confirmado!</h1>
                <p className="text-lg text-green-700">
                    Seu almoço para <br />
                    <span className="font-bold uppercase">{format(tomorrow, "dd 'de' MMMM", { locale: ptBR })}</span>
                </p>
            </div>

            <Card className="border-2 border-green-100 shadow-lg bg-white/80 backdrop-blur">
                <CardContent className="p-8 flex flex-col items-center space-y-6">
                    <div className="bg-white p-8 rounded-xl">
                        <QRCode
                            value={orderId}
                            size={200}
                            fgColor="#15803d" // green-700
                        />
                    </div>

                    <div className="text-center space-y-1">
                        <p className="text-sm text-slate-400 uppercase tracking-widest font-semibold">Seu Prato</p>
                        <p className="text-2xl font-bold text-slate-900">{itemName || 'Refeição'}</p>
                    </div>

                    <div className="w-full h-px bg-slate-100" />

                    <p className="text-xs text-center text-slate-400">
                        Apresente este código no refeitório para retirar sua refeição.
                    </p>
                </CardContent>
            </Card>

            <div className="pt-4">
                <Button asChild className="w-full h-14 text-lg font-semibold bg-white text-slate-700 border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300">
                    <Link href="/selection">
                        <Home className="w-5 h-5 mr-2" />
                        Voltar ao Início
                    </Link>
                </Button>
            </div>
        </div>
    )
}

export default function SuccessPage() {
    return (
        <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
            <Suspense fallback={<div>Carregando...</div>}>
                <SuccessContent />
            </Suspense>
        </div>
    )
}
