export function toUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function getTomorrowUTC(): Date {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + 1)
  return date
}
