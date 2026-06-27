import { useInfiniteQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { Fragment, useMemo, useState } from 'react'

import { getPreviousPipelineDay } from '@/api/pipelineHistory'
import LoadingDots from '@/components/LoadingDots'
import PipelineRunDetails from '@/components/PipelineRunDetails'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate, formatDateTime, formatDuration, formatNA } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import type { PipelineRun } from '@/models/pipelineRun'

const statusTone = (status: PipelineRun['status']): 'success' | 'fail' | 'warning' | 'neutral' => {
  switch (status) {
    case 'success': return 'success'
    case 'fail': return 'fail'
    case 'partial': return 'warning'
    default: return 'neutral'
  }
}

const decisionTone = (run: PipelineRun): 'success' | 'fail' | 'neutral' => {
  switch (run.decision?.result_type) {
    case 'order_plan': return 'success'
    case 'skip': return 'fail'
    default: return 'neutral'
  }
}

const decisionLabel = (run: PipelineRun): string => {
  switch (run.decision?.result_type) {
    case 'order_plan': return 'ORDER'
    case 'skip': return 'SKIP'
    default: return formatNA()
  }
}

interface DaySection {
  date?: Date
  runs: PipelineRun[]
}

const fetchSection = async (pageParam?: Date): Promise<DaySection> => {
  const runs = await getPreviousPipelineDay(pageParam)
  const start = runs[runs.length - 1]?.start
  const date = start ? new Date(new Date(start).setUTCHours(0, 0, 0, 0)) : undefined
  return { date, runs }
}

function PipelineRuns() {
  const [openRuns, setOpenRuns] = useState<Set<string>>(new Set())
  const [hidePartial, setHidePartial] = useState(false)

  const toggleRun = (key: string) =>
    setOpenRuns((prev) => {
      const next = new Set(prev)
      if (prev.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const { data: { pages = [] } = {}, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
    queryKey: ['pipelineHistory'],
    queryFn: ({ pageParam }) => fetchSection(pageParam),
    initialPageParam: undefined as Date | undefined,
    getNextPageParam: (lastPage) => lastPage.date
  })

  const sections = useMemo(() => {
    const allSections = pages.filter(({ runs }) => runs.length > 0)
    if (!hidePartial) return allSections
    return allSections
      .map(({ date, runs }) => ({ date, runs: runs.filter(r => r.status !== 'partial') }))
      .filter(({ runs }) => runs.length > 0)
  }, [pages, hidePartial])

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Pipeline runs</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Hide partial</span>
          <Switch checked={hidePartial} onCheckedChange={setHidePartial} />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-border/15 hover:bg-border/15">
            <TableHead>Status</TableHead>
            <TableHead>Decision</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead>Interval</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead className="w-8" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sections.map(({ date, runs }, index) => (
            <Fragment key={date ? date.toISOString() : `section-${index}`}>
              <TableRow>
                <TableCell colSpan={7} className="select-none text-sm text-muted-foreground">
                  {formatDate(date)} * {runs.length} runs
                </TableCell>
              </TableRow>
              {runs.map((run, runIndex) => {
                const key = `${index}-${runIndex}`
                const isOpen = openRuns.has(key)
                return (
                  <Fragment key={key}>
                    <TableRow className="cursor-pointer" onClick={() => toggleRun(key)}>
                      <TableCell>
                        <Badge variant="outline" tone={statusTone(run.status)}>
                          {run.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" tone={decisionTone(run)}>
                          {decisionLabel(run)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold">{formatNA(run.symbol)}</TableCell>
                      <TableCell>{formatNA(run.interval)}</TableCell>
                      <TableCell>{formatDateTime(run.start)}</TableCell>
                      <TableCell>{formatDuration(run.durationMs)}</TableCell>
                      <TableCell>
                        <ChevronRight
                          className={cn(
                            'size-4 text-muted-foreground transition-transform',
                            isOpen && 'rotate-90',
                          )}
                        />
                      </TableCell>
                    </TableRow>
                    {isOpen && (
                      <TableRow>
                        <TableCell colSpan={7} className="p-0">
                          <PipelineRunDetails run={run} />
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                )
              })}
            </Fragment>
          ))}
        </TableBody>
      </Table>
      <Button
        variant="link"
        onClick={() => fetchNextPage()}
        disabled={isFetching || !hasNextPage}
        className="self-start"
      >
        {isFetching ? <LoadingDots /> : hasNextPage ? 'Load more' : 'No more runs'}
      </Button>
    </div>
  )
}

export default PipelineRuns
