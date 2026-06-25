import { Fragment, useState } from 'react'

import { useInfiniteQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'

import { getPreviousPipelineDay } from '@/api/pipelineHistory'
import LoadingDots from '@/components/LoadingDots'
import PipelineRunDetails from '@/components/PipelineRunDetails'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { formatDate, formatDateTime, formatDuration, getTomorrowUTC } from '@/lib/date'
import type { PipelineRun } from '@/models/pipelineRun'

const statusTone = (status: PipelineRun['status']): 'success' | 'fail' | 'neutral' => {
  if (status === 'success') return 'success'
  if (status === 'fail') return 'fail'
  return 'neutral'
}

const decisionTone = (run: PipelineRun): 'success' | 'fail' | 'neutral' => {
  if (!run.decision) return 'neutral'
  return run.decision.result_type === 'order_plan' ? 'success' : 'fail'
}

const decisionLabel = (run: PipelineRun): string => {
  if (!run.decision) return '—'
  return run.decision.result_type === 'order_plan' ? 'ORDER' : 'SKIP'
}

interface DaySection {
  date?: Date
  runs: PipelineRun[]
}

const fetchSection = async (pageParam: Date): Promise<DaySection> => {
  const runs = await getPreviousPipelineDay(pageParam)
  const start = runs[runs.length - 1]?.start
  const date = start ? new Date(new Date(start).setUTCHours(0, 0, 0, 0)) : undefined
  return { date, runs }
}

function PipelineRuns() {
  const [openRuns, setOpenRuns] = useState<Set<string>>(new Set())

  const toggleRun = (key: string) =>
    setOpenRuns((prev) => {
      const next = new Set(prev)
      prev.has(key) ? next.delete(key) : next.add(key)
      return next
    })

  const { data: { pages = [] } = {}, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
    queryKey: ['pipelineHistory'],
    queryFn: ({ pageParam }) => fetchSection(pageParam),
    initialPageParam: getTomorrowUTC(),
    getNextPageParam: (lastPage) => lastPage.date
  })

  const sections = pages.filter(({ runs }) => runs.length > 0)

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-bold">Pipeline runs</h2>
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
                      <TableCell className="font-bold">{run.symbol ?? '—'}</TableCell>
                      <TableCell>{run.interval ?? '—'}</TableCell>
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
