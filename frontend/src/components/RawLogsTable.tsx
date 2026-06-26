import { useState } from 'react'

import { formatNA, formatTime } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import type { PipelineLog } from '@/models/pipelineRun'

const LEVEL_ABBR: Record<string, string> = {
  trace: 'TRC',
  debug: 'DBG',
  information: 'INF',
  warning: 'WRN',
  error: 'ERR',
  critical: 'CRT',
  fatal: 'FTL',
}

const abbreviateLevel = (level: string): string => LEVEL_ABBR[level.toLowerCase()] ?? formatNA()

const thClass = 'px-[1ch] py-1 text-left font-normal text-foreground align-top overflow-hidden whitespace-nowrap text-ellipsis'
const tdClass = 'px-[1ch] py-0 text-muted-foreground align-top overflow-hidden whitespace-nowrap text-ellipsis'

function RawLogsTable({ logs }: { logs: PipelineLog[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (prev.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <table className="w-full table-fixed text-xs font-mono">
      <colgroup>
        <col className="w-[14ch]" />
        <col className="w-[5ch]" />
        <col className="w-[12ch]" />
        <col />
        <col className="w-[10ch]" />
        <col className="w-0 sm:w-[10ch]" />
        <col className="w-0 sm:w-[10ch]" />
      </colgroup>
      <thead className="border-b border-muted-foreground/30">
        <tr>
          <th className={thClass}>Time</th>
          <th className={thClass}>Lvl</th>
          <th className={thClass}>Service</th>
          <th className={thClass}>Message</th>
          <th className={thClass}>Inv ID</th>
          <th className={cn(thClass, 'hidden sm:table-cell')}>Corr ID</th>
          <th className={cn(thClass, 'hidden sm:table-cell text-right')}>ID</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log) => (
          <tr
            key={log.id}
            className="border-b border-muted-foreground/20 last:border-0 cursor-pointer"
            onClick={() => toggle(log.id)}
          >
            <td className={tdClass}>{formatTime(log.timestamp)}</td>
            <td className={tdClass}>{abbreviateLevel(log.level)}</td>
            <td className={tdClass}>{log.service}</td>
            <td className={cn(tdClass, expanded.has(log.id) && 'overflow-visible whitespace-normal text-clip break-all')}>
              {log.message}
            </td>
            <td className={tdClass}>{log.invocationId}</td>
            <td className={cn(tdClass, 'hidden sm:table-cell')}>{log.correlationId}</td>
            <td className={cn(tdClass, 'hidden sm:table-cell [direction:rtl]')}>
              <span dir="ltr">{log.id}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default RawLogsTable
