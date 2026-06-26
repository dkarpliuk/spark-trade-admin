import OrderPlanDecisionResult from '@/components/decision/OrderPlanDecisionResult'
import SkipDecisionResult from '@/components/decision/SkipDecisionResult'
import type { PipelineDecision } from '@/models/pipelineRun'

function DecisionResult({ decision }: { decision: PipelineDecision }) {
  if (decision.result_type === 'skip') return <SkipDecisionResult decision={decision} />
  if (decision.result_type === 'order_plan') return <OrderPlanDecisionResult decision={decision} />
  return null
}

export default DecisionResult
