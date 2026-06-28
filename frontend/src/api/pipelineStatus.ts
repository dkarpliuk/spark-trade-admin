import { apiGet } from '@/api/client'

export type AppStatus = 'Running' | 'Stopped' | 'Unknown'

export interface PipelineStatusDto {
  chartScreenStatus: AppStatus
  chartQuantStatus: AppStatus
  sparkTradeStatus: AppStatus
}

export async function getPipelineStatus(): Promise<PipelineStatusDto> {
  return apiGet<PipelineStatusDto>('/api/pipeline-status')
}
