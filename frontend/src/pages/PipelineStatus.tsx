import { useQuery, useQueryClient } from '@tanstack/react-query'

import { type AppStatus, getPipelineStatus, PipelineService } from '@/api/pipelineStatus'
import RefreshButton from '@/components/RefreshButton'
import { Badge } from '@/components/ui/badge'
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

function PipelineStatus() {
  const queryClient = useQueryClient()

  const { data, isFetching } = useQuery({
    queryKey: ['pipelineStatus'],
    queryFn: getPipelineStatus,
  })

  const handleRefresh = () => queryClient.invalidateQueries({ queryKey: ['pipelineStatus'] })

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
            <TableHead>Status</TableHead>
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
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export default PipelineStatus
