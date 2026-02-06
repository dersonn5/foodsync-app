'use server'

import axios from 'axios'

interface SendConfirmationParams {
    phone: string
    dishName: string
}

export async function sendConfirmationMessage({ phone, dishName }: SendConfirmationParams) {
    try {
        const apiUrl = process.env.EVOLUTION_API_URL
        const apiKey = process.env.EVOLUTION_API_KEY
        const instance = process.env.EVOLUTION_INSTANCE || 'default' // Fallback if needed, though usually required

        if (!apiUrl || !apiKey) {
            console.warn('Evolution API credentials not set. Skipping WhatsApp message.')
            return
        }

        // Clean phone number: remove non-numeric chars
        const cleanPhone = phone.replace(/\D/g, '')

        // Format for Evolution (assuming 55 + DDD + Phone if not already formatted, but clean mostly works)
        // Ideally it should be just the number. Evolution usually expects full number with country code.
        // If user input is just 11999999999, we might need to add 55. 
        // For MVP, assuming the phone provided in user record implies a simplified format, 
        // but usually cleaner to ensure country code. 
        // Let's assume input might be mixed and ensure at least it starts with 55 if length is small?
        // Safe bet: just send clean numbers.

        // Construct the message
        const message = `âœ… *Pedido Confirmado!* \n\nPrato: ${dishName} \nData: AmanhÃ£ \n\nAcesse seu ticket aqui: https://${process.env.NEXT_PUBLIC_VERCEL_URL || 'kitchenos.app'}/ticket`

        await axios.post(
            `${apiUrl}/message/sendText/${instance}`,
            {
                number: cleanPhone,
                options: {
                    delay: 1200,
                    presence: "composing",
                    linkPreview: false
                },
                textMessage: {
                    text: message
                }
            },
            {
                headers: {
                    apikey: apiKey
                }
            }
        )

        console.log(`WhatsApp sent to ${cleanPhone}`)

    } catch (error: any) {
        console.error('Failed to send WhatsApp confirmation:', error.response?.data || error.message)
        // We don't throw here to avoid breaking the UI flow. It's a "fire and forget" notification.
    }
}

