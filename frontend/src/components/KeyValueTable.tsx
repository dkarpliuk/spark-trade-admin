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
            "flex flex-wrap items-start",
            "border-b border-muted-foreground/20 py-0.5 last:border-0"
          )}>
          <span className="flex-1 text-muted-foreground">{label}</span>
          <span className="flex-1 min-w-fit pl-4 text-right text-foreground">
            {formatNA(value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default KeyValueTable
