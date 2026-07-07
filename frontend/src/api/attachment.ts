import { apiGetText, apiUrl } from '@/api/client'

export type AttachmentType = 'chartScreenshot' | 'analysisText'

export function getAttachmentUrl(type: AttachmentType, blobName: string): string {
  return apiUrl(`/api/attachment/${type}/${encodeURIComponent(blobName)}`)
}

export function getAttachmentText(blobName: string): Promise<string> {
  return apiGetText(`/api/attachment/analysisText/${encodeURIComponent(blobName)}`)
}
