"use server"

import jsqr from 'jsqr'
import jpeg from 'jpeg-js'

export async function scanQRCodeServer(base64Image: string) {
    try {
        // 1. Limpa o cabeçalho data:image/jpeg;base64,...
        const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "")

        // 2. Converte para Buffer
        const buffer = Buffer.from(cleanBase64, 'base64')

        // 3. Decodifica o JPEG para Raw Pixel Data (Uint8Array)
        // useTArray: true retorna um Uint8Array que o jsqr aceita melhor
        const rawImageData = jpeg.decode(buffer, { useTArray: true })

        // 4. Tenta ler o QR Code
        // jsqr(data, width, height)
        const code = jsqr(rawImageData.data, rawImageData.width, rawImageData.height)

        if (code) {
            console.log("✅ Server Scan Sucesso:", code.data)
            return { success: true, text: code.data }
        }

        return { success: false, error: "QR Code não detectado na imagem." }
    } catch (error) {
        console.error("❌ Server Scan Error:", error)
        return { success: false, error: "Erro ao processar imagem no servidor." }
    }
}
