"use server"

import vision from '@google-cloud/vision'

// Inicializa o Google Vision com as chaves do .env.local
const client = new vision.ImageAnnotatorClient({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Importante: corrige quebras de linha
        project_id: process.env.GOOGLE_PROJECT_ID,
    }
});

export async function scanImageWithGoogle(base64Image: string) {
    try {
        // 1. Limpa a imagem (remove o prefixo data:image...)
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        // 2. Manda para o Google (TEXT_DETECTION lê tudo, até QR code rasgado)
        const [result] = await client.textDetection(buffer);
        const detections = result.textAnnotations;

        if (!detections || detections.length === 0) {
            return { success: false, text: null };
        }

        // 3. A mágica: Pega todo o texto que o Google leu
        const fullText = detections[0].description || "";

        // Debug: Mostra no terminal do VS Code o que o Google está enxergando
        console.log("👀 Google Vision viu:", fullText.replace(/\n/g, " "));

        // 4. Filtra para achar o Short ID (6 caracteres)
        // Procura por "palavras" que tenham exatamente 6 letras/números
        const words = fullText.split(/\s+/);

        // Tenta achar o Short ID (Ex: A5BFC9)
        const potentialCode = words.find(w => w.length === 6 && /^[A-Za-z0-9]+$/.test(w));

        // Se não achar de 6, tenta achar o UUID longo (caso antigo)
        const potentialLongId = words.find(w => w.length > 20 && w.includes('-'));

        const finalCode = potentialCode || potentialLongId || fullText;

        return { success: true, text: finalCode };

    } catch (error) {
        console.error("❌ Erro Google Vision:", error);
        return { success: false, error: "Erro ao processar imagem" };
    }
}
