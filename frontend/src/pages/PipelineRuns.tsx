import { useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { getLatestPipelineDay, getPreviousPipelineDay } from '@/api/pipelineHistory'
import type { PipelineRun } from '@/models/pipelineRun'
import { formatDateTime } from '@/lib/date'
import LoadingDots from '@/components/LoadingDots'
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

interface DaySection {
  date: string
  runs: PipelineRun[]
}

const formatDuration = (durationMs: number | null): string => {
  if (durationMs == null) return '—'
  return `${(durationMs / 1000).toFixed(1)} s`
}

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

const inferSectionDate = (runs: PipelineRun[]): string | null => {
  const earliest = runs[runs.length - 1]
  return earliest?.start ? earliest.start.toISOString().slice(0, 10) : null
}

function PipelineRuns() {
  const [sections, setSections] = useState<DaySection[]>([])
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const loadNextDay = async () => {
    setLoadingMore(true)
    try {
      const runs = sections.length === 0
        ? await getLatestPipelineDay()
        : await getPreviousPipelineDay(sections[sections.length - 1].date)
      const newDate = inferSectionDate(runs)
      if (!newDate) {
        setHasMore(false)
        return
      }
      setSections((prev) =>
        prev.some((section) => section.date === newDate) ? prev : [...prev, { date: newDate, runs }],
      )
    } finally {
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    loadNextDay()
  }, [])

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-bold">Pipeline runs</h2>
      {sections.map((section) => (
        <section key={section.date} className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">
            {section.date} · {section.runs.length} runs
          </span>
          {section.runs.length === 0 ? (
            <p className="text-muted-foreground">No runs.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
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
                {section.runs.map((run, index) => (
                  <TableRow key={index}>
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
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>
      ))}
      <Button
        variant="link"
        onClick={loadNextDay}
        disabled={loadingMore || !hasMore}
        className="self-start"
      >
        {loadingMore ? <LoadingDots /> : hasMore ? 'Load more' : 'No more runs'}
      </Button>
    </div>
  )
}

export default PipelineRuns
