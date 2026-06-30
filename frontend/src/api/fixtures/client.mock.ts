import type { PipelineRunDto } from '@/api/pipelineHistory'

import chartSampleUrl from './chart-sample.png'
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
  if (CHART_IMAGE_PATH.test(path)) return chartSampleUrl
  return path
}

const CHART_IMAGE_PATH = new RegExp('^/api/chart-image/[^/]+$')
const PIPELINE_DAY_PATH = new RegExp('^/api/pipeline-history/[^/]+$')
const PIPELINE_PREVIOUS_DAY_PATH = new RegExp('^/api/pipeline-history/previous(\\?.*)?$')
const FAKE_LATENCY_MS = 2000

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function apiGet<T>(path: string): Promise<T> {
  await delay(FAKE_LATENCY_MS)

  if (PIPELINE_DAY_PATH.test(path) || PIPELINE_PREVIOUS_DAY_PATH.test(path)) {
    return pipelineHistoryFixture as unknown as T
  }

  throw new ApiError(`No mock registered for ${path}`, 404)
}

export async function apiPost(_path: string): Promise<void> {
  await delay(FAKE_LATENCY_MS)
}
