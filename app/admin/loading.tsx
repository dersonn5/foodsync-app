import { Loader2 } from 'lucide-react'

export default function Loading() {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-slate-500 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <p className="animate-pulse text-sm font-medium">Carregando painel...</p>
        </div>
    )
}
