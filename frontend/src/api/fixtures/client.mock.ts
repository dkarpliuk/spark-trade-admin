import type { PipelineRunDto } from '@/api/pipelineHistory'
import pipelineHistoryFixtureJson from './pipelineHistory.fixture.json'

const pipelineHistoryFixture = pipelineHistoryFixtureJson as PipelineRunDto[]

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function apiUrl(path: string): string {
  return path
}

const PIPELINE_DAY_PATH = new RegExp('^/api/pipeline-history/[^/]+$')
const PIPELINE_PREVIOUS_DAY_PATH = new RegExp('^/api/pipeline-history/[^/]+/previous$')

export async function apiGet<T>(path: string): Promise<T> {
  if (PIPELINE_DAY_PATH.test(path) || PIPELINE_PREVIOUS_DAY_PATH.test(path)) {
    return pipelineHistoryFixture as unknown as T
  }

  throw new ApiError(`No mock registered for ${path}`, 404)
}
