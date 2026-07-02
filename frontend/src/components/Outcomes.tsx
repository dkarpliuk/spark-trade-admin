import type { BarShapeProps } from 'recharts'
import { Bar, BarChart, LabelList, Rectangle, XAxis, YAxis } from 'recharts'

import { type ChartConfig, ChartContainer } from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import type { PipelineSignal } from '@/models/pipelineRun'

const chartConfig = {
  higher: { label: 'Higher', color: 'var(--chart-green)' },
  sideways: { label: 'Sideways', color: 'var(--chart-white)' },
  lower: { label: 'Lower', color: 'var(--chart-red)' },
} satisfies Record<keyof PipelineSignal['outcome'], ChartConfig[string]>

function Outcomes({ outcome, className }: { outcome: PipelineSignal['outcome']; className?: string }) {
  const chartData = Object.entries(chartConfig).map(([key, config]) => ({
    key,
    ...config,
    value: outcome[key as keyof PipelineSignal['outcome']].probability * 100,
  }))

  return (
    <ChartContainer config={chartConfig} className={cn('h-18 w-full', className)}>
      <BarChart data={chartData} layout="vertical">
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis
          dataKey="label"
          type="category"
          interval={0}
          tickLine={false}
          width="auto"
          tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
        />
        <Bar
          dataKey="value"
          barSize={8}
          radius={[0, 4, 4, 0]}
          shape={({ payload, ...rest }: BarShapeProps) => (
            <Rectangle {...rest} fill={payload.color} fillOpacity={0.2} stroke={payload.color} strokeOpacity={0.6} />
          )}
        >
          <LabelList
            dataKey="value"
            position="right"
            fill="var(--foreground)"
            fontSize={12}
            formatter={(value) => `${Number(value).toFixed(1)}%`}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

export default Outcomes
