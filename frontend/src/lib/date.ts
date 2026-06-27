export function toUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}
