import { apiGet } from '@/api/client'
import { parsePipelineRun, type PipelineRun } from '@/models/pipelineRun'
import { toUtcDateKey } from '@/lib/date'

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

export async function getPipelineDay(date: Date): Promise<PipelineRun[]> {
  const dtos = await apiGet<PipelineRunDto[]>(`/api/pipeline-history/${toUtcDateKey(date)}`)
  return dtos.map(parsePipelineRun)
}

export async function getPreviousPipelineDay(date: Date): Promise<PipelineRun[]> {
  const dtos = await apiGet<PipelineRunDto[]>(`/api/pipeline-history/${toUtcDateKey(date)}/previous`)
  return dtos.map(parsePipelineRun)
}
