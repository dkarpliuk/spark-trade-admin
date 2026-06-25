import { cn } from '@/lib/utils'
import type { PipelineSignal } from '@/models/pipelineRun'

const OUTCOMES = [
  { label: 'Higher', key: 'higher', className: 'border border-success/60 bg-success/20' },
  { label: 'Sideways', key: 'sideways', className: 'border border-foreground/60 bg-foreground/20' },
  { label: 'Lower', key: 'lower', className: 'border border-fail/60 bg-fail/20' },
] as const

function Outcomes({ outcome }: { outcome: PipelineSignal['outcome'] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {OUTCOMES.map(({ label, key, className }) => {
        const pct = outcome[key].probability * 100
        return (
          <div key={key} className="flex items-center gap-2">
            <span className="w-14 shrink-0 text-xs text-muted-foreground">{label}</span>
            <div className="flex-1 h-2 rounded-sm ring-1 ring-inset ring-muted-foreground/45">
              <div
                className={cn('h-full rounded-sm', className)}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-xs text-foreground">
              {pct.toFixed(1)}%
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default Outcomes
