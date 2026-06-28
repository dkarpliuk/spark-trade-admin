import KeyValueTable from '@/components/KeyValueTable'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/formatters'
import type { PipelineOrderPlanDecision } from '@/models/pipelineRun'

import TradeVisual from './TradeVisual'

function OrderPlanDecisionResult({ decision }: { decision: PipelineOrderPlanDecision }) {
  const rows = [
    { label: 'Quantity', value: String(decision.quantity) },
    {
      label: 'Margin',
      value: (decision.quantity * decision.entry_price / decision.leverage).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    },
    { label: 'Leverage', value: `${decision.leverage}x` },
    { label: 'Created at', value: formatDateTime(new Date(decision.createdAt)) },
  ]
  return (
    <div className="flex flex-1 flex-col gap-2">
      <div>
        <Badge variant="outline" className="w-12">
          {decision.side.toUpperCase()}
        </Badge>
      </div>
      <TradeVisual decision={decision} />
      <KeyValueTable rows={rows} />
    </div>
  )
}

export default OrderPlanDecisionResult
