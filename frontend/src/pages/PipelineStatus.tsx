import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Play, Square } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import {
  type AppStatus,
  getPipelineStatus,
  manualTriggerChartScreen,
  PipelineService,
  type PipelineStatusDto,
  startService,
  stopService,
} from '@/api/pipelineStatus'
import LoadingDots from '@/components/LoadingDots'
import RefreshButton from '@/components/RefreshButton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toSentenceCase } from '@/lib/formatters'

type AppAction = 'start' | 'stop'
type DialogAction = { open: boolean; services: PipelineService[]; action: AppAction; }

const statusClassName = (status: AppStatus): string => {
  switch (status) {
    case 'running': return 'status-success'
    case 'stopped': return 'status-fail'
    default: return 'status-neutral'
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
  const [dialog, setDialog] = useState<DialogAction>({ open: false, services: [], action: 'start' })
  const [triggerDialog, setTriggerDialog] = useState(false)
  const allServices = Object.values(PipelineService)

  const { data, isFetching } = useQuery({
    queryKey: ['pipelineStatus'],
    queryFn: getPipelineStatus,
    refetchInterval: (query) => hasTransitional(query.state.data) ? 4000 : false,
    staleTime: 60 * 1000
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

  const { mutate: triggerChartScreen, isPending: isTriggerPending } = useMutation({
    mutationFn: manualTriggerChartScreen,
    onSuccess: () => toast.success('ChartScreen triggered', { position: 'top-center', duration: 4000 }),
    onError: () => toast.error('Failed to trigger ChartScreen', { position: 'top-center', duration: 4000 }),
  })

  const handleConfirm = () => {
    if (dialog.action === 'start')
      dialog.services.filter((s) => data?.[s] === 'stopped').forEach((s) => start(s))
    else
      dialog.services.filter((s) => data?.[s] === 'running').forEach((s) => stop(s))
  }

  const canToggleAll = (action: AppAction) => {
    if (isFetching || !data || hasTransitional(data)) return false
    if (action === 'start') return Object.values(data).some((s) => s === 'stopped')
    if (action === 'stop') return Object.values(data).some((s) => s === 'running')
    return false
  }

  const actions = [
    {
      label: 'Start All',
      disabled: !canToggleAll('start'),
      onClick: () => setDialog({ open: true, services: allServices, action: 'start' }),
    },
    {
      label: 'Stop All',
      disabled: !canToggleAll('stop'),
      onClick: () => setDialog({ open: true, services: allServices, action: 'stop' }),
    },
    {
      label: 'Manual Trigger',
      disabled: isFetching || isTriggerPending || data?.ChartScreen !== 'running',
      onClick: () => setTriggerDialog(true),
    },
  ]

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Pipeline status</h2>
        <div className="flex items-center gap-1">
          <RefreshButton isFetching={isFetching} onRefresh={handleRefresh} />
          <div className="hidden gap-1 md:flex">
            {actions.map(({ label, disabled, onClick }) => (
              <Button key={label} variant="outline" size="sm" disabled={disabled} onClick={onClick}>
                {label}
              </Button>
            ))}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="md:hidden">Actions</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {actions.map(({ label, disabled, onClick }) => (
                <DropdownMenuItem key={label} disabled={disabled} onSelect={onClick}>{label}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="-mx-4 sm:mx-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data && (Object.entries(data) as Array<[PipelineService, AppStatus]>).map(([service, status]) => {
              const disabled = isFetching || isTransitional(status)
              const action = getAppAction(status)
              return (
                <TableRow key={service}>
                  <TableCell>{service}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusClassName(status)}>
                      {status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {action && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-full"
                        disabled={disabled}
                        onClick={() => setDialog({ open: true, services: [service], action })}
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
            {!data && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={3}>
                  <LoadingDots className="text-muted-foreground" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={dialog.open} onOpenChange={(open) => setDialog((prev) => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialog.action === 'start' ? 'Start' : 'Stop'} {formatTarget(dialog.services)}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {dialog.action} {formatTarget(dialog.services)}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>{toSentenceCase(dialog.action)}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={triggerDialog} onOpenChange={setTriggerDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Manual Trigger ChartScreen?</AlertDialogTitle>
            <AlertDialogDescription>
              This will manually trigger the ScreenshotTimer on ChartScreen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => triggerChartScreen()}>Trigger</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default PipelineStatus
