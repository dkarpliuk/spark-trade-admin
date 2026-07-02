import { format, isValid } from 'date-fns'

export const toSentenceCase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

export function ellipsisMiddle(str: string, n: number): string {
  if (str.length <= n * 2 + 3) return str
  return `${str.slice(0, n)}…${str.slice(-n)}`
}

export function abbreviateFileName(name: string): string {
  const dotIndex = name.lastIndexOf('.')
  const ext = dotIndex !== -1 ? name.slice(dotIndex) : ''
  const base = dotIndex !== -1 ? name.slice(0, dotIndex) : name
  return ellipsisMiddle(base, 4) + ext
}

export function formatNA(value?: string | null): string {
  return value ?? 'n/a'
}

export function formatPrice(value: number, fractionDigits = 2): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })
}

export function formatDuration(durationMs: number | null): string {
  if (durationMs == null) return formatNA()
  return `${(durationMs / 1000).toFixed(1)} s`
}

export function formatDate(date?: Date | null): string {
  if (!date || !isValid(date)) return formatNA()
  return format(date, 'yyyy-MM-dd')
}

export function formatMonthDay(date?: Date | null): string {
  if (!date || !isValid(date)) return formatNA()
  return format(date, 'MMM dd')
}

export function formatTime(date: Date | null): string {
  if (!date || !isValid(date)) return formatNA()
  return format(date, 'HH:mm:ss')
}

export function formatTimeMs(date: Date | null): string {
  if (!date || !isValid(date)) return formatNA()
  return format(date, 'HH:mm:ss.SSS')
}

export function formatDateTime(date?: Date | null): string {
  if (!date || !isValid(date)) return formatNA()
  return format(date, 'yyyy-MM-dd HH:mm:ss')
}
