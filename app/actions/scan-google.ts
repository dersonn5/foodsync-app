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

        // 1. Pega TUDO o que está escrito na tela
        const fullText = detections[0].description || "";

        // Debug: Mostra o que ele leu no terminal (pra você ver o FRANGO aparecendo lá)
        console.log("👀 Texto Bruto:", fullText.replace(/\n/g, " "));

        // 2. Quebra em palavras individuais
        const words = fullText.split(/[\s\n]+/);

        // --- LISTA NEGRA DE PALAVRAS COMUNS ---
        // (Caso algum Short ID venha sem números por azar, isso garante que não pegue palavras óbvias)
        const ignoredWords = [
            "TICKET", "SEU", "PEDIDO", "CODIGO", "CODE", "STATUS", "MENU",
            "FRANGO", "CARNE", "PEIXE", "MOLHO", "SALADA", "BEBIDA", "SUCO",
            "PENDING", "CONFIRMED", "CANCELLED", "FOODSYNC", "TOTAL", "VALOR"
        ];

        // 3. O FILTRO INTELIGENTE
        const foundShortId = words.find(word => {
            const clean = word.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

            // Regra 1: Tamanho exato de 6 caracteres
            if (clean.length !== 6) return false;

            // Regra 2: Lista Negra (Anti-Frango)
            if (ignoredWords.includes(clean)) return false;

            // Regra 3 (A MAIS IMPORTANTE): Tem que ter letras E números?
            // Seus IDs são MD5, então quase sempre têm números.
            // Palavras reais nunca têm números.
            const hasNumber = /[0-9]/.test(clean);
            const hasLetter = /[A-Z]/.test(clean);

            // ACEITA SE: Tiver número E letra (Ex: A5BFC9)
            if (hasNumber && hasLetter) return true;

            // ACEITA SE: For só letras, mas NÃO for uma palavra conhecida 
            // (Risco baixo, mas possível se o hash for tipo "ABCDEF")
            // Nesse caso, confiamos na Lista Negra acima.
            if (!hasNumber && hasLetter) {
                // Se for puramente letras, só aceitamos se NÃO parecer uma palavra real
                // Mas para garantir, vamos dar prioridade para os que têm número.
                return false; // Por segurança, vamos exigir número por enquanto.
            }

            return false;
        });

        if (foundShortId) {
            return { success: true, text: foundShortId.toUpperCase() };
        }

        // 4. Fallback: Se não achou Short ID, tenta achar UUID longo antigo
        const foundLongId = words.find(word => word.length > 20 && word.includes('-'));
        if (foundLongId) return { success: true, text: foundLongId };

        return { success: false, error: "Nenhum código válido encontrado" };

    } catch (error) {
        console.error("❌ Erro Google Vision:", error);
        return { success: false, error: "Erro interno Vision" };
    }
}
