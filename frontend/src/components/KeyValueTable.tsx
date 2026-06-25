import { formatNA } from '@/lib/formatters'

interface KeyValueRow {
  label: string
  value: string | null | undefined
}

function KeyValueTable({ rows }: { rows: KeyValueRow[] }) {
  return (
    <div className="flex w-full flex-col">
      {rows.map(({ label, value }) => (
        <div key={label} className="flex flex-wrap border-b border-muted-foreground/20 py-0.5 last:border-0">
          <div className="shrink-0 pr-4 text-xs text-muted-foreground">{label}</div>
          <div className="ml-auto shrink-0 text-right text-xs text-foreground">{formatNA(value)}</div>
        </div>
      ))}
    </div>
  )
}

export default KeyValueTable
