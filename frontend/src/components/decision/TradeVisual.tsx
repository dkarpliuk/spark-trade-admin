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

  const topPct = (isBuy ? tpDist : slDist) / entry_price * 100
  const bottomPct = (isBuy ? slDist : tpDist) / entry_price * 100
  const topPctClass = isBuy ? 'text-success' : 'text-fail'
  const bottomPctClass = isBuy ? 'text-fail' : 'text-success'

  const rows = isBuy
    ? [
        { label: 'Take profit', value: fmt(take_profit_price) },
        { label: 'Entry', value: fmt(entry_price) },
        { label: 'Stop loss', value: fmt(stop_loss_price) },
      ]
    : [
        { label: 'Stop loss', value: fmt(stop_loss_price) },
        { label: 'Entry', value: fmt(entry_price) },
        { label: 'Take profit', value: fmt(take_profit_price) },
      ]

  return (
    <div className="grid grid-cols-[3rem_1fr] grid-rows-[auto_1fr_auto] gap-x-2">
      <span className={`col-start-1 row-start-1 text-xs text-center ${topPctClass}`}>{topPct.toFixed(2)}%</span>
      <div className="col-start-1 row-start-2 relative">
        <svg
          className="absolute inset-0 h-full w-full opacity-50"
          viewBox={`0 0 1 ${total}`}
          preserveAspectRatio="none"
        >
          <rect x="0" y="0" width="1" height={topDist} fill={topColor} />
          <rect x="0" y={topDist} width="1" height={bottomDist} fill={bottomColor} />
        </svg>
      </div>
      <span className={`col-start-1 row-start-3 text-xs text-center ${bottomPctClass}`}>{bottomPct.toFixed(2)}%</span>
      <div className="col-start-2 row-start-2">
        <KeyValueTable rows={rows} />
      </div>
    </div>
  )
}

export default TradeVisual
