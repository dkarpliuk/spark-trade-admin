import { apiGet } from '@/api/client'

export type PipelineStatusDto = 'unknown' | 'success' | 'fail'

export interface PipelineLogDto {
  id: string
  service: string
  timestamp: string | null
  level: string
  message: string
  invocationId: string | null
  correlationId: string | null
}

export interface PipelineRunDto {
  status: PipelineStatusDto
  symbol: string | null
  interval: string | null
  chartTimestamp: string | null
  blobName: string | null
  signal: string | null
  decision: string | null
  start: string | null
  end: string | null
  durationMs: number | null
  logs: PipelineLogDto[]
}

export function getPipelineDay(date: string): Promise<PipelineRunDto[]> {
  return apiGet<PipelineRunDto[]>(`/api/pipeline-history/${date}`)
}

export function getPreviousPipelineDay(date: string): Promise<PipelineRunDto[]> {
  return apiGet<PipelineRunDto[]>(`/api/pipeline-history/${date}/previous`)
}
