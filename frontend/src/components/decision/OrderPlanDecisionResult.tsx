import KeyValueTable from '@/components/KeyValueTable'
import { Badge } from '@/components/ui/badge'
import { formatDateTime, formatPrice } from '@/lib/formatters'
import type { PipelineOrderPlanDecision } from '@/models/pipelineRun'

import TradeVisual from './TradeVisual'

function OrderPlanDecisionResult({ decision }: { decision: PipelineOrderPlanDecision }) {
  const rows = [
    { label: 'Quantity', value: String(decision.quantity) },
    { label: 'Margin', value: formatPrice(decision.quantity * decision.entry_price / decision.leverage) },
    { label: 'Leverage', value: `${decision.leverage}x` },
    { label: 'Created at', value: formatDateTime(new Date(decision.created_at)) },
  ]

  const priceRows = [
    { label: 'Take profit', value: formatPrice(decision.take_profit_price) },
    { label: 'Entry', value: formatPrice(decision.entry_price) },
    { label: 'Stop loss', value: formatPrice(decision.stop_loss_price) },
  ]

  if (decision.side.toLowerCase() !== 'buy') priceRows.reverse()

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div>
        <Badge variant="outline" className="w-12">
          {decision.side.toUpperCase()}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <TradeVisual decision={decision} />
        <KeyValueTable rows={priceRows} />
      </div>
      <KeyValueTable rows={rows} />
    </div>
  )
}

export default OrderPlanDecisionResult
