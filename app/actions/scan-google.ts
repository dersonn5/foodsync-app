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

        // Manda para o Google
        const [result] = await client.textDetection(buffer);
        const detections = result.textAnnotations;

        if (!detections || detections.length === 0) {
            return { success: false, text: null };
        }

        // Pega o texto completo
        const fullText = detections[0].description || "";

        // LOG (Para debug no seu terminal)
        console.log("👀 Google leu tudo isso:", fullText.replace(/\n/g, " | "));

        // --- AQUI ESTÁ A CORREÇÃO ---
        // Separa tudo o que foi lido em palavras individuais
        // (Quebra por espaço ou quebra de linha)
        const words = fullText.split(/[\s\n]+/);

        // 1. Procura pelo Short ID (Padrão: 6 caracteres, letras e números)
        // Ex: A5BFC9
        const foundShortId = words.find(word => {
            const clean = word.trim().toUpperCase().replace(/[^A-Z0-9]/g, ""); // Remove sujeira
            // A regra: Tem que ter EXATAMENTE 6 digitos
            return clean.length === 6 && /^[A-Z0-9]{6}$/.test(clean);
        });

        if (foundShortId) {
            return { success: true, text: foundShortId.toUpperCase() };
        }

        // 2. Se não achar Short ID, tenta achar UUID (Código longo antigo)
        const foundLongId = words.find(word => word.length > 20 && word.includes('-'));

        if (foundLongId) {
            return { success: true, text: foundLongId };
        }

        // Se não achou nenhum código válido, retorna erro
        return { success: false, error: "Nenhum código válido encontrado" };

    } catch (error) {
        console.error("❌ Erro Google Vision:", error);
        return { success: false, error: "Erro interno no Vision API" };
    }
}
