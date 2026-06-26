import KeyValueTable from '@/components/KeyValueTable'
import Outcomes from '@/components/Outcomes'
import { formatDateTime } from '@/lib/formatters'
import type { PipelineSignal } from '@/models/pipelineRun'

function SignalAnalysis({ signal }: { signal: PipelineSignal }) {
  const rows = [
    { label: 'Trend', value: signal.trend },
    {
      label: 'Price at analysis',
      value: signal.price_at_analysis.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    },
    { label: 'Forecast horizon', value: `${signal.forecast_horizon_candles} candles` },
    { label: 'Created at', value: formatDateTime(new Date(signal.createdAt)) },
  ]

  return (
    <div className="flex flex-1 flex-col gap-2">
      <KeyValueTable rows={rows} />
      <Outcomes className="mt-auto" outcome={signal.outcome} />
    </div>
  )
}

export default SignalAnalysis
