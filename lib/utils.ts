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
