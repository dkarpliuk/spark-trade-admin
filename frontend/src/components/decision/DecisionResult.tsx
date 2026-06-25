import SkipDecisionResult from '@/components/decision/SkipDecisionResult'
import type { PipelineDecision } from '@/models/pipelineRun'

function DecisionResult({ decision }: { decision: PipelineDecision }) {
  if (decision.result_type === 'skip') return <SkipDecisionResult decision={decision} />
  return null
}

export default DecisionResult
