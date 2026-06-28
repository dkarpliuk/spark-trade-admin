import { apiGet } from '@/api/client'

export type AppStatus = 'running' | 'starting' | 'stopping' | 'stopped' | 'unknown'

export const PipelineService = {
  ChartScreen: 'ChartScreen',
  ChartQuant: 'ChartQuant',
  SparkTrade: 'SparkTrade',
} as const

export type PipelineService = typeof PipelineService[keyof typeof PipelineService]

export type PipelineStatusDto = {
  [K in PipelineService]: AppStatus
}

export async function getPipelineStatus(): Promise<PipelineStatusDto> {
  return apiGet<PipelineStatusDto>('/api/pipeline-status')
}
