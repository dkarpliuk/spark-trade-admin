interface KeyValueRow {
  label: string
  value: string
}

function KeyValueTable({ rows }: { rows: KeyValueRow[] }) {
  return (
    <table className="w-full border-collapse">
      <tbody>
        {rows.map(({ label, value }) => (
          <tr key={label} className="border-b border-muted-foreground/20 last:border-0">
            <td className="py-0.5 pr-4 text-xs text-muted-foreground">{label}</td>
            <td className="py-0.5 text-right text-xs text-foreground">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default KeyValueTable
