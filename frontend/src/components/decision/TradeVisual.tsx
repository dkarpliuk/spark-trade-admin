import { Bar, BarChart, BarStack, LabelList, YAxis } from 'recharts'

import type { PipelineOrderPlanDecision } from '@/models/pipelineRun'

const CHART_WIDTH = 48
const CHART_HEIGHT = 96

function TradeVisual({ decision }: { decision: PipelineOrderPlanDecision }) {
  const { entry_price, take_profit_price, stop_loss_price, side } = decision
  const isBuy = side.toLowerCase() === 'buy'

  const upperPrice = isBuy ? take_profit_price : stop_loss_price
  const lowerPrice = isBuy ? stop_loss_price : take_profit_price

  const topColor = isBuy ? 'var(--chart-green)' : 'var(--chart-red)'
  const bottomColor = isBuy ? 'var(--chart-red)' : 'var(--chart-green)'

  const formatSegmentPct = (value: unknown) => {
    const [start, end] = value as [number, number]
    return `${((end - start) / entry_price * 100).toFixed(2)}%`
  }

  const chartData = [{ name: 'trade', bottom: [lowerPrice, entry_price], top: [entry_price, upperPrice] }]

  return (
    <div className="flex justify-center text-xs">
      <BarChart
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        data={chartData}
        margin={{ top: 16, right: 5, bottom: 16, left: 5 }}
        barCategoryGap={0}
        barGap={0}
      >
        <YAxis hide domain={[lowerPrice, upperPrice]} />
        <BarStack radius={4}>
          <Bar dataKey="bottom" fill={bottomColor} fillOpacity={0.4} style={{ fill: bottomColor }}>
            <LabelList dataKey="bottom" position="bottom" formatter={formatSegmentPct} fill={bottomColor} style={{ fill: bottomColor }} fontSize={12} />
          </Bar>
          <Bar dataKey="top" fill={topColor} fillOpacity={0.4} style={{ fill: topColor }}>
            <LabelList dataKey="top" position="top" formatter={formatSegmentPct} fill={topColor} style={{ fill: topColor }} fontSize={12} />
          </Bar>
        </BarStack>
      </BarChart>
    </div>
  )
}

export default TradeVisual
