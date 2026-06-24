import { apiUrl } from '@/api/client'

export function getChartImageUrl(blobName: string): string {
  return apiUrl(`/api/chart-image/${encodeURIComponent(blobName)}`)
}
