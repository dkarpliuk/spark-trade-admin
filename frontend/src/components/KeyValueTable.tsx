import { formatNA } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface KeyValueRow {
  label: string
  value: string | null | undefined
}

function KeyValueTable({ rows }: { rows: KeyValueRow[] }) {
  return (
    <div className="w-full text-xs">
      {rows.map(({ label, value }) => (
        <div
          key={label}
          className={cn(
            "flex flex-wrap items-start gap-x-2",
            "border-b border-muted-foreground/20 py-0.5 last:border-0"
          )}>
          <span className="text-muted-foreground">{label}</span>
          <span className="flex-1 min-w-fit text-right text-foreground">
            {formatNA(value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default KeyValueTable
