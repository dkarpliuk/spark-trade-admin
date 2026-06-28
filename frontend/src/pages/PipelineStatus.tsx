import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Play, Square } from 'lucide-react'
import { useState } from 'react'

import {
  type AppStatus,
  getPipelineStatus,
  PipelineService,
  type PipelineStatusDto,
  startService,
  stopService,
} from '@/api/pipelineStatus'
import LoadingDots from '@/components/LoadingDots'
import RefreshButton from '@/components/RefreshButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type AppAction = 'start' | 'stop'
type DialogAction = { services: PipelineService[]; action: AppAction }

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


const formatTarget = (services: PipelineService[]) =>
  services.length === Object.values(PipelineService).length ? 'all services' : services.join(', ')

const getAppAction = (status: AppStatus): AppAction | undefined => {
  switch (status) {
    case 'running': case 'starting': return 'stop'
    case 'stopped': case 'stopping': return 'start'
    default: return undefined
  }
}

function PipelineStatus() {
  const queryClient = useQueryClient()
  const [dialog, setDialog] = useState<DialogAction | null>(null)
  const allServices = Object.values(PipelineService)

  const { data, isFetching } = useQuery({
    queryKey: ['pipelineStatus'],
    queryFn: getPipelineStatus,
    refetchInterval: (query) => hasTransitional(query.state.data) ? 4000 : false,
  })

  const handleRefresh = () => queryClient.invalidateQueries({ queryKey: ['pipelineStatus'] })

  const setServiceStatus = (service: PipelineService, status: AppStatus) =>
    queryClient.setQueryData<PipelineStatusDto>(['pipelineStatus'], (prev) =>
      prev ? { ...prev, [service]: status } : prev
    )

  const { mutate: start } = useMutation({
    mutationFn: startService,
    onMutate: (service) => setServiceStatus(service, 'starting'),
  })

  const { mutate: stop } = useMutation({
    mutationFn: stopService,
    onMutate: (service) => setServiceStatus(service, 'stopping'),
  })

  const handleConfirm = () => {
    if (!dialog) return
    if (dialog.action === 'start')
      dialog.services.filter((s) => data?.[s] === 'stopped').forEach((s) => start(s))
    else
      dialog.services.filter((s) => data?.[s] === 'running').forEach((s) => stop(s))
    setDialog(null)
  }

  const canToggleAll = (action: AppAction) => {
    if (isFetching || !data || hasTransitional(data)) return false
    if (action === 'start') return Object.values(data).some((s) => s === 'stopped')
    if (action === 'stop') return Object.values(data).some((s) => s === 'running')
    return false
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
        <h2 className="text-lg font-bold">Pipeline status</h2>
        <div className="flex gap-1 items-center justify-end">
          <RefreshButton isFetching={isFetching} onRefresh={handleRefresh} />
          <Button
            variant="ghost"
            size="sm"
            disabled={!canToggleAll('start')}
            onClick={() => setDialog({ services: allServices, action: 'start' })}
          >
            Start All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!canToggleAll('stop')}
            onClick={() => setDialog({ services: allServices, action: 'stop' })}
          >
            Stop All
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-border/15 hover:bg-border/15">
              <TableHead>Service</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          {data && (
            <TableBody>
              {(Object.entries(data) as Array<[PipelineService, AppStatus]>).map(([service, status]) => {
                const disabled = isFetching || isTransitional(status)
                const action = getAppAction(status)
                return (
                  <TableRow key={service}>
                    <TableCell className="font-medium">{service}</TableCell>
                    <TableCell>
                      <Badge variant="outline" tone={statusTone(status)}>
                        {status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {action && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={disabled}
                          onClick={() => setDialog({ services: [service], action })}
                        >
                          {action === 'start'
                            ? <Play className="size-4 text-success" />
                            : <Square className="size-4 text-fail" />
                          }
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          )}
        </Table>
      </div>

      {!data && <LoadingDots className="text-muted-foreground" />}

      <Dialog open={!!dialog} onOpenChange={(open) => !open && setDialog(null)}>
        {dialog && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dialog.action === 'start' ? 'Start' : 'Stop'} {formatTarget(dialog.services)}?</DialogTitle>
              <DialogDescription>
                Are you sure you want to {dialog.action} {formatTarget(dialog.services)}?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter showCloseButton>
              <DialogClose asChild>
                <Button
                  variant={dialog.action === 'stop' ? 'destructive' : 'default'}
                  onClick={handleConfirm}
                >
                  {dialog.action === 'start' ? 'Start' : 'Stop'}
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}

export default PipelineStatus
