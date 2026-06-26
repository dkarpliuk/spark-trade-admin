import KeyValueTable from '@/components/KeyValueTable'
import type { PipelineOrderPlanDecision } from '@/models/pipelineRun'

function fmt(price: number) {
  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function TradeVisual({ decision }: { decision: PipelineOrderPlanDecision }) {
  const { entry_price, take_profit_price, stop_loss_price, side } = decision
  const isBuy = side.toLowerCase() === 'buy'

  const tpDist = Math.abs(take_profit_price - entry_price)
  const slDist = Math.abs(entry_price - stop_loss_price)
  const total = tpDist + slDist

  const topDist = isBuy ? tpDist : slDist
  const bottomDist = isBuy ? slDist : tpDist
  const topColor = isBuy ? 'var(--success)' : 'var(--fail)'
  const bottomColor = isBuy ? 'var(--fail)' : 'var(--success)'

  const tpPct = (tpDist / entry_price * 100).toFixed(2)
  const slPct = (slDist / entry_price * 100).toFixed(2)

  const rows = isBuy
    ? [
        { label: 'Take profit', value: `${tpPct}% | ${fmt(take_profit_price)}` },
        { label: 'Entry', value: fmt(entry_price) },
        { label: 'Stop loss', value: `${slPct}% | ${fmt(stop_loss_price)}` },
      ]
    : [
        { label: 'Stop loss', value: `${slPct}% | ${fmt(stop_loss_price)}` },
        { label: 'Entry', value: fmt(entry_price) },
        { label: 'Take profit', value: `${tpPct}% | ${fmt(take_profit_price)}` },
      ]

  return (
    <div className="flex gap-2">
      <div className="relative w-8 shrink-0 self-stretch ring-1 ring-inset ring-foreground/0">
        <svg
          className="absolute inset-0 h-full w-full opacity-50"
          viewBox={`0 0 1 ${total}`}
          preserveAspectRatio="none"
        >
          <rect x="0" y="0" width="1" height={topDist} fill={topColor} />
          <rect x="0" y={topDist} width="1" height={bottomDist} fill={bottomColor} />
        </svg>
      </div>
      <KeyValueTable rows={rows} />
    </div>
  )
}

export default TradeVisual
