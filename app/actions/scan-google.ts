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

        // 1. Pega o texto bruto
        const fullText = detections[0].description || "";

        // LOG: Veja como o Google está lendo (provavelmente separado)
        console.log("👀 Texto Bruto:", fullText.replace(/\n/g, " "));

        // 2. TÁTICA DO ASPIRADOR: Remove espaços, quebras de linha e símbolos
        // Transforma "Ticket: A5 BFC9" em "TICKETA5BFC9"
        const cleanStream = fullText.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

        // 3. CAÇA AO TESOURO: Procura sequências de 6 caracteres dentro da "tripa"
        // Regex: Pega grupos de 6 caracteres alfanuméricos
        const potentialCodes = cleanStream.match(/.{1,6}/g) || [];

        // Melhor: Vamos percorrer a string procurando padrões válidos
        // Isso aqui encontra o código mesmo se ele estiver grudado em outra palavra
        // Ex: "PEDIDOA5BFC9" -> Acha o A5BFC9
        const regex = /[A-Z0-9]{6}/g;
        const matches = cleanStream.match(regex);

        if (!matches) {
            return { success: false, error: "Nenhum padrão encontrado" };
        }

        // 4. FILTRO DE QUALIDADE
        const validCode = matches.find(code => {
            // O código é: "A5BFC9"

            // Regra 1: Lista Negra (Palavras de 6 letras que podem aparecer)
            const blacklist = ["TICKET", "FRANGO", "PEDIDO", "CODIGO", "STATUS", "FOODSYNC", "BRLBRL", "VALORR"];
            if (blacklist.includes(code)) return false;

            // Regra 2 (A MAIS FORTE): Tem que ter NÚMERO?
            // Seu código A5BFC9 tem números. Frango não tem.
            const hasNumber = /[0-9]/.test(code);
            const hasLetter = /[A-Z]/.test(code);

            // Se tiver número e letra, é 100% o Short ID.
            if (hasNumber && hasLetter) return true;

            // Se for só números (ex: 123456), aceitamos.
            if (hasNumber && !hasLetter) return true;

            // Se for só letras (ex: ABCDEF), só aceitamos se NÃO for blacklist.
            // Mas como seu exemplo tem número, vamos priorizar os que têm número.
            return false;
        });

        if (validCode) {
            return { success: true, text: validCode };
        }

        // Fallback: Tenta achar UUID longo se falhar o curto
        const longId = fullText.split(/\s+/).find(w => w.length > 20 && w.includes('-'));
        if (longId) return { success: true, text: longId };

        return { success: false, error: "Código não detectado." };

    } catch (error) {
        console.error("❌ Erro Google Vision:", error);
        return { success: false, error: "Erro interno" };
    }
}
