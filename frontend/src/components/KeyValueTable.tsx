import { useRef } from 'react'

import { formatNA } from '@/lib/formatters'
import { useTabularCopy } from '@/lib/tabularCopy'
import { cn } from '@/lib/utils'

interface KeyValueRow {
  label: string
  value: string | null | undefined
}

function KeyValueTable({ rows }: { rows: KeyValueRow[] }) {
  const ref = useRef<HTMLDivElement>(null)
  useTabularCopy(ref)

  return (
    <div ref={ref} className="w-full text-xs">
      {rows.map(({ label, value }) => (
        <div
          data-row
          key={label}
          className={cn(
            "flex flex-wrap items-start",
            "border-b border-muted-foreground/20 py-0.5 last:border-0"
          )}>
          <span data-cell className="flex-1 text-muted-foreground">{label}</span>
          <span data-cell className="flex-1 min-w-fit pl-4 text-right text-foreground">
            {formatNA(value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default KeyValueTable
