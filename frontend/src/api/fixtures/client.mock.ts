import type { PipelineRunDto } from '@/api/pipelineHistory'

import chartSampleUrl from './chart-sample.png'
import pipelineHistoryFixtureJson from './pipelineHistory.fixture.json'

const pipelineHistoryFixture = pipelineHistoryFixtureJson as PipelineRunDto[]

const SAMPLE_ANALYSIS_TEXT = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
`

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function apiUrl(path: string): string {
  if (ATTACHMENT_IMAGE_PATH.test(path)) return chartSampleUrl
  return path
}

const ATTACHMENT_IMAGE_PATH = new RegExp('^/api/attachment/chartScreenshot/[^/]+$')
const ATTACHMENT_TEXT_PATH = new RegExp('^/api/attachment/analysisText/[^/]+$')
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

export async function apiGetText(path: string): Promise<string> {
  await delay(FAKE_LATENCY_MS)

  if (ATTACHMENT_TEXT_PATH.test(path)) return SAMPLE_ANALYSIS_TEXT

  throw new ApiError(`No mock registered for ${path}`, 404)
}

export async function apiPost(_path: string): Promise<void> {
  await delay(FAKE_LATENCY_MS)
}
