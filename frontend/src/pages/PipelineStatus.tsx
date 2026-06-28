import { useQuery, useQueryClient } from '@tanstack/react-query'
import { RotateCw } from 'lucide-react'
import { useEffect, useState } from 'react'

import { type AppStatus,getPipelineStatus } from '@/api/pipelineStatus'
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

const statusTone = (status: AppStatus): 'success' | 'fail' | 'neutral' => {
  switch (status) {
    case 'running': return 'success'
    case 'stopped': return 'fail'
    default: return 'neutral'
  }
}

const SERVICES: { label: string; key: keyof Awaited<ReturnType<typeof getPipelineStatus>> }[] = [
  { label: 'Chart Screen', key: 'chartScreenStatus' },
  { label: 'Chart Quant', key: 'chartQuantStatus' },
  { label: 'Spark Trade', key: 'sparkTradeStatus' },
]

function PipelineStatus() {
  const queryClient = useQueryClient()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { data, isFetching } = useQuery({
    queryKey: ['pipelineStatus'],
    queryFn: getPipelineStatus,
  })

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isFetching) setIsRefreshing(false)
  }, [isFetching])

  const handleRefresh = () => {
    setIsRefreshing(true)
    queryClient.invalidateQueries({ queryKey: ['pipelineStatus'] })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Pipeline status</h2>
        <Button variant="ghost" size="icon-sm" disabled={isFetching} onClick={handleRefresh}>
          <RotateCw className={cn('size-4', isFetching && isRefreshing && 'animate-spin')} />
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-border/15 hover:bg-border/15">
            <TableHead>Service</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {SERVICES.map(({ label, key }) => {
            const status = data?.[key]
            return (
              <TableRow key={key}>
                <TableCell className="font-medium">{label}</TableCell>
                <TableCell>
                  {status ? (
                    <Badge variant="outline" tone={statusTone(status)}>
                      {status.toUpperCase()}
                    </Badge>
                  ) : (
                    '—'
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export default PipelineStatus
