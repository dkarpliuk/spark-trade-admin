import { useState } from 'react'

import ChartScreenshot from '@/components/ChartScreenshot'
import DecisionResult from '@/components/decision/DecisionResult'
import RawLogsTable from '@/components/RawLogsTable'
import SignalAnalysis from '@/components/SignalAnalysis'
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
      case logsOpen: return `− Hide raw logs (${run.logs.length})`
      case run.logs.length === 0: return 'No raw logs'
      default: return `+ View raw logs (${run.logs.length})`
    }
  })()

  return (
    <div className="flex flex-col bg-muted-foreground/15">
      <div className="grid grid-cols-3 divide-x">
        <div className="flex min-w-0 flex-col gap-3 p-2">
          <SectionTitle>Chart Screenshot</SectionTitle>
          <ChartScreenshot blobName={run.blobName} />
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
      <div className="flex flex-col gap-2 p-2 border-t border-border">
        <button
          disabled={!run.logs.length}
          onClick={() => setLogsOpen((v) => !v)}
          className="self-start text-xs font-semibold tracking-widest text-muted-foreground hover:text-foreground"
        >
          {logsButtonLabel}
        </button>
        {logsOpen && <RawLogsTable logs={run.logs} />}
      </div>
    </div>
  )
}

export default PipelineRunDetails
