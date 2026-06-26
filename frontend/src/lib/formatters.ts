export function ellipsisMiddle(str: string, n: number): string {
  if (str.length <= n * 2 + 3) return str
  return `${str.slice(0, n)}...${str.slice(-n)}`
}

export function abbreviateBlobName(name: string): string {
  const dotIndex = name.lastIndexOf('.')
  const ext = dotIndex !== -1 ? name.slice(dotIndex) : ''
  const base = dotIndex !== -1 ? name.slice(0, dotIndex) : name
  return ellipsisMiddle(base, 4) + ext
}

export function formatNA(value?: string | null): string {
  return value ?? 'n/a'
}

export function formatDuration(durationMs: number | null): string {
  if (durationMs == null) return formatNA()
  return `${(durationMs / 1000).toFixed(1)} s`
}

export function formatDate(date?: Date | null): string {
  if (!date || isNaN(date.getTime())) return formatNA()
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function formatDateTime(date?: Date | null): string {
  if (!date || isNaN(date.getTime())) return formatNA()
  const pad = (n: number) => n.toString().padStart(2, '0')
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  )
}
