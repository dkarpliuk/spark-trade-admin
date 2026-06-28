import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Play, Square } from 'lucide-react'

import {
  type AppStatus,
  getPipelineStatus,
  PipelineService,
  type PipelineStatusDto,
  startService,
  stopService,
} from '@/api/pipelineStatus'
import RefreshButton from '@/components/RefreshButton'
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

const statusTone = (status: AppStatus): 'success' | 'fail' | 'neutral' => {
  switch (status) {
    case 'running': return 'success'
    case 'stopped': return 'fail'
    default: return 'neutral'
  }
}

const isTransitional = (status: AppStatus) => status === 'starting' || status === 'stopping'
const hasTransitional = (data?: PipelineStatusDto) =>
  data ? Object.values(data).some(isTransitional) : false

function PipelineStatus() {
  const queryClient = useQueryClient()
  const { data, isFetching } = useQuery({
    queryKey: ['pipelineStatus'],
    queryFn: getPipelineStatus,
    refetchInterval: (query) => hasTransitional(query.state.data) ? 4000 : false,
  })

  const handleRefresh = () => queryClient.invalidateQueries({ queryKey: ['pipelineStatus'] })

  const setStatus = (service: PipelineService, status: AppStatus) =>
    queryClient.setQueryData<PipelineStatusDto>(['pipelineStatus'], (prev) =>
      prev ? { ...prev, [service]: status } : prev
    )

  const { mutate: start } = useMutation({
    mutationFn: startService,
    onMutate: (service) => setStatus(service, 'starting'),
  })

  const { mutate: stop } = useMutation({
    mutationFn: stopService,
    onMutate: (service) => setStatus(service, 'stopping'),
  })

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Pipeline status</h2>
        <RefreshButton isFetching={isFetching} onRefresh={handleRefresh} />
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-border/15 hover:bg-border/15">
            <TableHead>Service</TableHead>
            <TableHead className="w-32">Status</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.values(PipelineService).map((service) => {
            const status = data?.[service]
            return (
              <TableRow key={service}>
                <TableCell className="font-medium">{service}</TableCell>
                <TableCell>
                  {status ? (
                    <Badge variant="outline" tone={statusTone(status)}>
                      {status.toUpperCase()}
                    </Badge>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell>
                  {(status === 'stopped' || status === 'stopping') && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={isFetching || isTransitional(status)}
                      onClick={() => start(service)}
                    >
                      <Play className="size-4 text-success" />
                    </Button>
                  )}
                  {(status === 'running' || status === 'starting') && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={isFetching || isTransitional(status)}
                      onClick={() => stop(service)}
                    >
                      <Square className="size-4 text-fail" />
                    </Button>
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
