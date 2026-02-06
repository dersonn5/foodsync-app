import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()

        // External n8n Webhook URL
        const N8N_URL = 'https://n8nwebhook.automaxio.com.br/webhook/kitchenos/disparo'

        const response = await fetch(N8N_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body || { date: '2026-01-20', action: 'trigger_confirmations' }),
        })

        if (!response.ok) {
            throw new Error(`n8n responded with status: ${response.status}`)
        }

        const data = await response.text() // n8n might return text or json

        return NextResponse.json({ success: true, message: 'Disparado com sucesso', data })
    } catch (error: any) {
        console.error('API Proxy Error:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
