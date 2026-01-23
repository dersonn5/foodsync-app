"use client"

import { Html5QrcodeScanner } from "html5-qrcode"
import { useEffect } from "react"

const qrcodeRegionId = "html5qr-code-full-region"

interface QrScannerProps {
    fps?: number
    qrbox?: number
    disableFlip?: boolean
    verbose?: boolean
    qrCodeSuccessCallback: (decodedText: string, decodedResult: any) => void
    qrCodeErrorCallback?: (errorMessage: string) => void
}

export const Html5QrcodePlugin = (props: QrScannerProps) => {

    useEffect(() => {
        // Configuração de Performance
        const config = {
            fps: props.fps || 10, // Tenta ler 10 vezes por segundo (Rápido!)
            qrbox: props.qrbox || 250, // Tamanho da área de foco
            aspectRatio: 1.0,
            disableFlip: props.disableFlip || false,
        }

        const verbose = props.verbose === true

        // Inicializa o Scanner
        // Nota: O html5-qrcode cria a UI automaticamente dentro da div
        const html5QrcodeScanner = new Html5QrcodeScanner(
            qrcodeRegionId,
            config,
            verbose
        )

        html5QrcodeScanner.render(
            props.qrCodeSuccessCallback,
            props.qrCodeErrorCallback
        )

        // Limpeza ao sair da página (Matar a câmera para não travar)
        return () => {
            html5QrcodeScanner.clear().catch((error) => {
                console.error("Falha ao limpar scanner", error)
            })
        }
    }, [])

    return (
        <div
            id={qrcodeRegionId}
            className="w-full overflow-hidden rounded-xl bg-slate-950 border-2 border-slate-800"
        />
    )
}
