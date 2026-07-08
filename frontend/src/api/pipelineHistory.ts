import { apiGet } from '@/api/client'
import { toUtcDateKey } from '@/lib/date'
import { parsePipelineRun, type PipelineRun } from '@/models/pipelineRun'

export type PipelineStatusDto = 'unknown' | 'complete' | 'partial' | 'running' | 'failed'
export type AttachmentTypeDto = 'chartScreenshot' | 'analysisText'

export interface PipelineLogDto {
  id: string
  service: string
  timestamp: string | null
  level: string
  message: string
  invocationId: string | null
  correlationId: string | null
}

export interface PipelineAttachmentDto {
  blobName: string
  type: AttachmentTypeDto
}

export interface PipelineRunDto {
  status: PipelineStatusDto
  symbol: string | null
  interval: string | null
  chartTimestamp: string | null
  modelName: string | null
  signal: string | null
  decision: string | null
  start: string | null
  end: string | null
  durationMs: number | null
  attachments: PipelineAttachmentDto[]
  logs: PipelineLogDto[]
}

export async function getPipelineDay(date: Date): Promise<PipelineRun[]> {
  const dtos = await apiGet<PipelineRunDto[]>(`/api/pipeline-history/${toUtcDateKey(date)}`)
  return dtos.map(parsePipelineRun)
}

export async function getPreviousPipelineDay(date?: Date): Promise<PipelineRun[]> {
  let path = '/api/pipeline-history/previous'
  if (date) path += `?current=${toUtcDateKey(date)}`
  const dtos = await apiGet<PipelineRunDto[]>(path)
  return dtos.map(parsePipelineRun)
}
