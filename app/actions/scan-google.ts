"use server"

import vision from '@google-cloud/vision'

const client = new vision.ImageAnnotatorClient({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        project_id: process.env.GOOGLE_PROJECT_ID,
    }
});

export async function scanImageWithGoogle(base64Image: string) {
    try {
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        const [result] = await client.textDetection(buffer);
        const detections = result.textAnnotations;

        if (!detections || detections.length === 0) {
            return { success: false, text: null };
        }

        // Pega o texto completo e divide em palavras
        const fullText = detections[0].description || "";
        // Divide por espaços ou quebra de linha
        const words = fullText.split(/[\s\n]+/);

        // --- LISTA NEGRA: Palavras que aparecem na tela mas NÃO são códigos ---
        const ignoredWords = [
            "TICKET", "SEU", "PEDIDO", "CODIGO", "CODE",
            "APRESENTE", "RETIRADA", "PENDING", "CONFIRMED",
            "CANCELLED", "STATUS", "MENU", "ID", "FOODSYNC"
        ];

        // 1. Procura pelo Short ID (6 caracteres, alfanumérico)
        const foundShortId = words.find(word => {
            const clean = word.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

            // Regra 1: Tem que ter EXATAMENTE 6 dígitos
            if (clean.length !== 6) return false;

            // Regra 2: NÃO pode estar na lista negra
            if (ignoredWords.includes(clean)) return false;

            // Regra 3: Deve parecer um código (Letras e Números)
            // (Opcional: se seus códigos forem só letras ou mistos, isso aceita ambos)
            return /^[A-Z0-9]{6}$/.test(clean);
        });

        if (foundShortId) {
            // Sucesso! Achamos o código real e ignoramos o "TICKET"
            return { success: true, text: foundShortId.toUpperCase() };
        }

        // 2. Se não achar Short ID, tenta achar UUID (Código longo antigo)
        const foundLongId = words.find(word => word.length > 20 && word.includes('-'));

        if (foundLongId) {
            return { success: true, text: foundLongId };
        }

        // Se só achou lixo (palavras da interface), retorna erro
        return { success: false, error: "Nenhum código válido encontrado" };

    } catch (error) {
        console.error("❌ Erro Google Vision:", error);
        return { success: false, error: "Erro interno Vision" };
    }
}
