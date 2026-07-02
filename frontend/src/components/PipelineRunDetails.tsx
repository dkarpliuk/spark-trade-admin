import { useState } from 'react'

import Attachments from '@/components/Attachments'
import DecisionResult from '@/components/decision/DecisionResult'
import RawLogsTable from '@/components/RawLogsTable'
import SignalAnalysis from '@/components/SignalAnalysis'
import { Button } from '@/components/ui/button'
import type { PipelineRun } from '@/models/pipelineRun'

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-widest text-foreground">
      {children}
    </span>
  )
}

function PipelineRunDetails({ run }: { run: PipelineRun }) {
  const [logsOpen, setLogsOpen] = useState(false)

  const logsButtonLabel = (() => {
    switch (true) {
      case logsOpen: return `- Hide raw logs (${run.logs.length})`
      case run.logs.length === 0: return 'No raw logs'
      default: return `+ View raw logs (${run.logs.length})`
    }
  })()

  return (
    <div className="whitespace-normal">
      <div className="grid grid-cols-3 divide-x">
        <div className="flex min-w-0 flex-col gap-3 p-2">
          <SectionTitle>Attachments</SectionTitle>
          <Attachments blobName={run.blobName} />
        </div>
        <div className="flex min-w-0 flex-col gap-3 p-2">
          <SectionTitle>Signal * Analysis</SectionTitle>
          {run.signal ? <SignalAnalysis signal={run.signal} /> : null}
        </div>
        <div className="flex min-w-0 flex-col gap-3 p-2">
          <SectionTitle>Decision * Result</SectionTitle>
          {run.decision ? <DecisionResult decision={run.decision} /> : null}
        </div>
      </div>
      <div className="p-2 border-t border-border">
        <Button
          variant="link"
          size="sm"
          disabled={!run.logs.length}
          onClick={() => setLogsOpen((v) => !v)}
          className="h-auto p-0"
        >
          {logsButtonLabel}
        </Button>
      </div>
      {logsOpen && (
        <div className="p-2">
          <RawLogsTable logs={run.logs} />
        </div>
      )}
    </div>
  )
}

export default PipelineRunDetails
