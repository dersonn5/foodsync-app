import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a "YYYY-MM-DD" string correctly in any timezone by setting time to Noon UTC.
 * Prevents "2026-01-23" becoming "22" in GMT-3.
 */
export function formatDateUTC(dateStr: string, formatStr: string) {
  if (!dateStr) return ''
  // Append T12:00:00Z to ensure we are safely in the middle of the day in UTC
  // This prevents timezone offsets from shifting the day
  const date = new Date(`${dateStr}T12:00:00`)
  return format(date, formatStr, { locale: ptBR })
}

export function formatDateDisplay(dateString: string) {
  if (!dateString) return "";

  // TRUQUE: Adiciona T12:00:00 para garantir que o fuso horário
  // nunca jogue a data para o dia anterior.
  // Ex: 2026-01-23 vira 2026-01-23T12:00:00.
  // Mesmo voltando 3h (Brasil), vira 09:00 da manhã do MESMO dia.
  const date = new Date(`${dateString}T12:00:00`);

  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short', // "jan"
    weekday: 'short' // "sex"
  }).format(date).replace('.', '');
}
