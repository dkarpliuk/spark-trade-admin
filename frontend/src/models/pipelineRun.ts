import type { PipelineLogDto, PipelineRunDto, PipelineStatusDto } from '@/api/pipelineHistory'

export type PipelineStatus = PipelineStatusDto

export interface PipelineLevel {
  from: number
  to: number
}

export interface PipelineSignal {
  created_at: string
  correlation_id: string
  symbol: string
  interval: string
  chart_timestamp: string
  forecast_horizon_candles: number
  price_at_analysis: number
  trend: string
  levels: PipelineLevel[]
  outcome: {
    higher: { probability: number }
    lower: { probability: number }
    sideways: { probability: number }
  }
}

export interface PipelineOrderPlanDecision {
  created_at: string
  result_type: 'order_plan'
  symbol: string
  side: string
  entry_order_type: string
  entry_price: number
  quantity: number
  take_profit_price: number
  stop_loss_price: number
  leverage: number
}

export interface PipelineSkipDecision {
  created_at: string
  result_type: 'skip'
  reason: string
  gate_name: string
}

export type PipelineDecision = PipelineOrderPlanDecision | PipelineSkipDecision

export interface PipelineLog {
  id: string
  service: string
  timestamp: Date | null
  level: string
  message: string
  invocationId: string | null
  correlationId: string | null
}

export interface PipelineRun {
  status: PipelineStatus
  symbol: string | null
  interval: string | null
  chartTimestamp: Date | null
  blobName: string | null
  signal: PipelineSignal | null
  decision: PipelineDecision | null
  start: Date | null
  end: Date | null
  durationMs: number | null
  logs: PipelineLog[]
}

function parseLog(dto: PipelineLogDto): PipelineLog {
  return {
    id: dto.id,
    service: dto.service,
    timestamp: dto.timestamp ? new Date(dto.timestamp) : null,
    level: dto.level,
    message: dto.message,
    invocationId: dto.invocationId,
    correlationId: dto.correlationId,
  }
}

export function parsePipelineRun(dto: PipelineRunDto): PipelineRun {
  return {
    status: dto.status,
    symbol: dto.symbol,
    interval: dto.interval,
    chartTimestamp: dto.chartTimestamp ? new Date(dto.chartTimestamp) : null,
    blobName: dto.blobName,
    signal: dto.signal ? (JSON.parse(dto.signal) as PipelineSignal) : null,
    decision: dto.decision ? (JSON.parse(dto.decision) as PipelineDecision) : null,
    start: dto.start ? new Date(dto.start) : null,
    end: dto.end ? new Date(dto.end) : null,
    durationMs: dto.durationMs,
    logs: dto.logs.map(parseLog),
  }
}
