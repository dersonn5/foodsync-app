"use client"

import React, { useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface ScannerProProps {
    onScanSuccess: (decodedText: string) => void;
}

export const ScannerPro: React.FC<ScannerProProps> = ({ onScanSuccess }) => {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const isProcessingRef = useRef(false);

    useEffect(() => {
        const qrcodeRegionId = "html5qr-code-full-region";

        // Configuração otimizada para leitura instantânea em cozinha industrial
        const config = {
            fps: 20, // Alta taxa de quadros para leitura rápida
            qrbox: { width: 280, height: 280 }, // Área de leitura maior
            aspectRatio: 1.0,
            // CRÍTICO: Usa API nativa do navegador (BarcodeDetector) se disponível
            // Isso usa o chip de scanner do celular para foco rápido
            experimentalFeatures: {
                useBarCodeDetectorIfSupported: true,
            },
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE] // Foca apenas em QR
        };

        const html5QrCode = new Html5Qrcode(qrcodeRegionId);
        scannerRef.current = html5QrCode;

        const qrCodeSuccessCallback = (decodedText: string) => {
            // Evita processamento duplicado
            if (isProcessingRef.current) return;
            isProcessingRef.current = true;

            // Feedback tátil imediato
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(200);
            }

            onScanSuccess(decodedText);

            // Pausa o scanner para evitar leituras múltiplas
            try {
                html5QrCode.pause(true);
                setTimeout(() => {
                    isProcessingRef.current = false;
                    if (html5QrCode.isScanning) {
                        html5QrCode.resume();
                    }
                }, 2000);
            } catch {
                isProcessingRef.current = false;
            }
        };

        // Inicia a câmera traseira
        html5QrCode.start(
            { facingMode: "environment" },
            config,
            qrCodeSuccessCallback,
            () => { } // Ignora erros de "nenhum código encontrado"
        ).catch((err) => {
            console.error("Erro ao iniciar câmera:", err);
        });

        // Limpeza ao desmontar
        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(() => { });
            }
        };
    }, [onScanSuccess]);

    return (
        <div className="w-full max-w-md mx-auto">
            <div
                id="html5qr-code-full-region"
                className="overflow-hidden rounded-2xl bg-black"
            />
            <p className="text-center text-sm text-white/60 mt-3 font-medium">
                Aponte para o QR Code do pedido
            </p>
        </div>
    );
};
