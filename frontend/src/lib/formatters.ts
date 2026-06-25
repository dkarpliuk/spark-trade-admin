export function formatNA(value?: string | null): string {
  return value ?? 'n/a'
}

export function formatDuration(durationMs: number | null): string {
  if (durationMs == null) return formatNA()
  return `${(durationMs / 1000).toFixed(1)} s`
}

export function formatDate(date?: Date | null): string {
  if (!date) return formatNA()
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function formatDateTime(date?: Date | null): string {
  if (!date) return formatNA()
  const pad = (n: number) => n.toString().padStart(2, '0')
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  )
}
