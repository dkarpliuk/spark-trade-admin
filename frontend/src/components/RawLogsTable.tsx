import { useRef, useState } from 'react'

import { formatNA, formatTimeMs } from '@/lib/formatters'
import { useTabularCopy } from '@/lib/tabularCopy'
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

const thClass = 'min-w-0 px-[1ch] py-1 text-left font-normal text-foreground border-b border-muted-foreground/30'
const tdClass = 'min-w-0 px-[1ch] py-0 text-muted-foreground border-b border-muted-foreground/20'
const clip = 'block overflow-hidden whitespace-nowrap text-ellipsis'

function RawLogsTable({ logs, fontFamily }: { logs: PipelineLog[], fontFamily?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useTabularCopy(ref)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    if (document.getSelection()?.toString()) return
    setExpanded((prev) => {
      const next = new Set(prev)
      if (prev.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div ref={ref} style={fontFamily ? { fontFamily: `${fontFamily}, var(--font-mono)` } : undefined} className={cn(
      "grid text-xs font-mono",
      "grid-cols-[14ch_5ch_12ch_1fr]",
      "sm:grid-cols-[14ch_5ch_12ch_1fr_10ch_10ch_10ch]"
    )}>
      <div data-row className="contents">
        <div className={thClass}><span data-cell className={clip}>Time</span></div>
        <div className={thClass}><span data-cell className={clip}>Lvl</span></div>
        <div className={thClass}><span data-cell className={clip}>Service</span></div>
        <div className={thClass}><span data-cell className={clip}>Message</span></div>
        <div className={cn(thClass, 'hidden sm:block')}><span data-cell className={clip}>Inv ID</span></div>
        <div className={cn(thClass, 'hidden sm:block')}><span data-cell className={clip}>Corr ID</span></div>
        <div className={cn(thClass, 'hidden sm:block text-right')}><span data-cell className={clip}>ID</span></div>
      </div>
      {logs.map((log) =>
        <div key={log.id} data-row className="contents [&:last-child>*]:border-0">
          <div className={tdClass}><span data-cell className={clip}>{formatTimeMs(log.timestamp)}</span></div>
          <div className={tdClass}><span data-cell className={clip}>{abbreviateLevel(log.level)}</span></div>
          <div className={tdClass}><span data-cell className={clip}>{log.service}</span></div>
          <div className={tdClass} onClick={() => toggle(log.id)}>
            <span data-cell className={cn(clip, expanded.has(log.id) && 'whitespace-normal break-all')}>{log.message}</span>
          </div>
          <div className={cn(tdClass, 'hidden sm:block')}><span data-cell className={clip}>{log.invocationId}</span></div>
          <div className={cn(tdClass, 'hidden sm:block')}><span data-cell className={clip}>{log.correlationId}</span></div>
          <div className={cn(tdClass, 'hidden sm:block')}>
            <span data-cell className={cn(clip, '[direction:rtl]')}><span dir="ltr">{log.id}</span></span>
          </div>
        </div>)}
    </div>
  )
}

export default RawLogsTable
