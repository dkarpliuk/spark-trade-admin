import KeyValueTable from '@/components/KeyValueTable'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/formatters'
import type { PipelineSkipDecision } from '@/models/pipelineRun'

function SkipDecisionResult({ decision }: { decision: PipelineSkipDecision }) {
  const rows = [
    { label: 'Reason', value: decision.reason },
    { label: 'Gate', value: decision.gate_name },
    { label: 'Created at', value: formatDateTime(new Date(decision.created_at)) },
  ]
  return (
    <div className="flex flex-1 flex-col gap-2">
      <div>
        <Badge variant="outline" className="w-12">SKIP</Badge>
      </div>
      <KeyValueTable rows={rows} />
    </div>
  )
}

export default SkipDecisionResult
