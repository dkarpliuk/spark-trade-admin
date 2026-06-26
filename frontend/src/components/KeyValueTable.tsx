import { formatNA } from '@/lib/formatters'

interface KeyValueRow {
  label: string
  value: string | null | undefined
}

function KeyValueTable({ rows }: { rows: KeyValueRow[] }) {
  return (
    <table className="w-full text-xs">
      <tbody>
        {rows.map(({ label, value }) => (
          <tr key={label} className="border-b border-muted-foreground/20 last:border-0">
            <td className="py-0.5 pr-4 align-top text-muted-foreground">{label}</td>
            <td className="break-words py-0.5 align-top text-right text-foreground">{formatNA(value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default KeyValueTable
