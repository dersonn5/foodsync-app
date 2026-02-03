'use client'

import { ChefHat, Construction } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
    return (
        <div className="flex-1 p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <ChefHat className="w-7 h-7 text-primary" />
                    Configurações
                </h1>

                <Card className="border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-muted-foreground">
                            <Construction className="w-5 h-5" />
                            Em Construção
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Esta página está sendo desenvolvida. Em breve você poderá configurar:
                        </p>
                        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-primary/50 rounded-full" />
                                Horários de funcionamento da cozinha
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-primary/50 rounded-full" />
                                Notificações e alertas
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-primary/50 rounded-full" />
                                Integrações e webhooks
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-primary/50 rounded-full" />
                                Personalização do cardápio
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
