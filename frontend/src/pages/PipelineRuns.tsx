import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { Fragment, useEffect, useMemo, useState } from 'react'

import { getPreviousPipelineDay } from '@/api/pipelineHistory'
import LoadingDots from '@/components/LoadingDots'
import PipelineRunDetails from '@/components/PipelineRunDetails'
import RefreshButton from '@/components/RefreshButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useIsMobile } from '@/hooks/use-breakpoint'
import { formatDate, formatDateTime, formatDuration, formatMonthDay, formatNA,formatTime } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import type { PipelineRun } from '@/models/pipelineRun'

const statusClassName = (status: PipelineRun['status']): string => {
  switch (status) {
    case 'complete': return 'status-success'
    case 'failed': return 'status-fail'
    case 'running': return 'status-warning'
    default: return 'status-neutral'
  }
}

const minStatusClassName = (status: PipelineRun['status']): string => {
  switch (status) {
    case 'complete': return 'bg-success'
    case 'failed': return 'bg-fail'
    case 'running': return 'bg-warning animate-[blink_1s_ease-in-out_infinite]'
    default: return 'bg-muted-foreground'
  }
}

const decisionClassName = (run: PipelineRun): string | undefined => {
  switch (run.decision?.result_type) {
    case 'order_plan': return 'status-success'
    case 'skip': return 'status-fail'
    default: return undefined
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
  const queryClient = useQueryClient()
  const [openRuns, setOpenRuns] = useState<Set<string>>(new Set())
  const [showPartial, setShowPartial] = useState(false)
  const isMobile = useIsMobile()

  const handleRefresh = () => queryClient.resetQueries({ queryKey: ['pipelineHistory'] })

  const toggleRun = (key: string) => {
    if (document.getSelection()?.toString()) return
    setOpenRuns((prev) => {
      const next = new Set(prev)
      if (prev.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const { data: { pages = [] } = {}, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
    queryKey: ['pipelineHistory'],
    queryFn: ({ pageParam }) => fetchSection(pageParam),
    initialPageParam: undefined as Date | undefined,
    getNextPageParam: (lastPage) => lastPage.date,
    staleTime: 5 * 60 * 1000
  })

  const sections = useMemo(() => {
    const filteredRuns = pages
      .flatMap(p => p.runs)
      .filter(r => (showPartial || r.status !== 'partial') && r.start != null)

    const grouped = Map.groupBy(filteredRuns, r => new Date(r.start!).setHours(0, 0, 0, 0))

    return Array.from(grouped, ([key, runs]) => ({ date: new Date(key), runs }))
  }, [pages, showPartial])

  const totalRuns = sections.reduce((sum, s) => sum + s.runs.length, 0)

  useEffect(() => {
    if (!isFetching && hasNextPage && totalRuns < 10) fetchNextPage()
  }, [isFetching, hasNextPage, totalRuns, fetchNextPage])

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Pipeline runs</h2>
        <div className="flex items-center gap-2">
          <RefreshButton isFetching={isFetching} onRefresh={handleRefresh} />
          <Label htmlFor="show-partial">Show partial</Label>
          <Switch id="show-partial" checked={showPartial} onCheckedChange={setShowPartial} />
        </div>
      </div>
      <div className="-mx-4 sm:mx-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{!isMobile && 'Status'}</TableHead>
              <TableHead>Decision</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>{isMobile ? 'TF' : "Interval"}</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="w-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sections.map(({ date, runs }, index) => (
              <Fragment key={date ? date.toISOString() : `section-${index}`}>
                <TableRow>
                  <TableCell colSpan={7} className="select-none text-xs text-muted-foreground">
                    {isMobile ? formatMonthDay(date) : formatDate(date)} * {runs.length} runs
                  </TableCell>
                </TableRow>
                {runs.map((run, runIndex) => {
                  const key = `${index}-${runIndex}`
                  const isOpen = openRuns.has(key)
                  return (
                    <Fragment key={key}>
                      <TableRow className="cursor-pointer" onClick={() => toggleRun(key)}>
                        <TableCell>
                          {isMobile ? (
                            <span className={cn("flex size-2 rounded-full", minStatusClassName(run.status))} />
                          ) : (
                            <Badge variant="outline" className={statusClassName(run.status)}>
                              {run.status.toUpperCase()}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={decisionClassName(run)}>
                            {decisionLabel(run)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatNA(run.symbol)}</TableCell>
                        <TableCell>{formatNA(run.interval)}</TableCell>
                        <TableCell>{isMobile ? formatTime(run.start) : formatDateTime(run.start)}</TableCell>
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
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={7}>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => fetchNextPage()}
                  disabled={isFetching || !hasNextPage}
                  className="p-0"
                >
                  {isFetching ? <LoadingDots /> : hasNextPage ? 'Load more' : 'No more runs'}
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default PipelineRuns
