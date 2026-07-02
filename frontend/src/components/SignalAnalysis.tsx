import KeyValueTable from '@/components/KeyValueTable'
import Outcomes from '@/components/Outcomes'
import { formatDateTime, formatPrice } from '@/lib/formatters'
import type { PipelineSignal } from '@/models/pipelineRun'

function SignalAnalysis({ signal }: { signal: PipelineSignal }) {
  const rows = [
    { label: 'Trend', value: signal.trend },
    { label: 'Price at analysis', value: formatPrice(signal.price_at_analysis) },
    { label: 'Forecast horizon', value: `${signal.forecast_horizon_candles} candles` },
    { label: 'Created at', value: formatDateTime(new Date(signal.created_at)) },
  ]

  return (
    <div className="flex flex-1 flex-col gap-2">
      <KeyValueTable rows={rows} />
      <Outcomes className="mt-auto" outcome={signal.outcome} />
    </div>
  )
}

export default SignalAnalysis
