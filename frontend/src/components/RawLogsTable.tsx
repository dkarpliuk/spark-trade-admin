import { useState } from 'react'

import { formatNA, formatTime } from '@/lib/formatters'
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

const thClass = 'px-[1ch] py-1 text-left font-normal text-foreground align-top'
const tdClass = 'px-[1ch] py-0 text-muted-foreground align-top'
const cellInner = 'overflow-hidden whitespace-nowrap text-ellipsis'

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
    <div className="w-full overflow-x-auto">
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
            <th className={thClass}><div className={cellInner}>Time</div></th>
            <th className={thClass}><div className={cellInner}>Lvl</div></th>
            <th className={thClass}><div className={cellInner}>Service</div></th>
            <th className={thClass}><div className={cellInner}>Message</div></th>
            <th className={thClass}><div className={cellInner}>Inv ID</div></th>
            <th className={`${thClass} hidden sm:table-cell`}><div className={cellInner}>Corr ID</div></th>
            <th className={`${thClass} hidden sm:table-cell`}><div className={`${cellInner} text-right`}>ID</div></th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr
              key={log.id}
              className="border-b border-muted-foreground/20 last:border-0 cursor-pointer"
              onClick={() => toggle(log.id)}
            >
              <td className={tdClass}><div className={cellInner}>{formatTime(log.timestamp)}</div></td>
              <td className={tdClass}><div className={cellInner}>{abbreviateLevel(log.level)}</div></td>
              <td className={tdClass}><div className={cellInner}>{log.service}</div></td>
              <td className={tdClass}>
                <div className={expanded.has(log.id) ? 'whitespace-normal break-all' : cellInner}>
                  {log.message}
                </div>
              </td>
              <td className={tdClass}><div className={cellInner}>{log.invocationId}</div></td>
              <td className={`${tdClass} hidden sm:table-cell`}><div className={cellInner}>{log.correlationId}</div></td>
              <td className={`${tdClass} hidden sm:table-cell`}>
                <div className={`${cellInner} [direction:rtl]`}><span dir="ltr">{log.id}</span></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default RawLogsTable
