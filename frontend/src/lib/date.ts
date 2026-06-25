export function toUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function getTomorrowUTC(): Date {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + 1)
  return date
}

export function formatDuration(durationMs: number | null): string {
  if (durationMs == null) return 'n/a'
  return `${(durationMs / 1000).toFixed(1)} s`
}

export function formatDate(date?: Date | null): string {
  if (!date) return 'n/a'
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function formatDateTime(date?: Date | null): string {
  if (!date) return 'n/a'
  const pad = (n: number) => n.toString().padStart(2, '0')
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  )
}
