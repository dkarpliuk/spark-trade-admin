import { useState } from 'react'

import type { PipelineRun } from '@/models/pipelineRun'

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </span>
  )
}

function PipelineRunDetails({ run }: { run: PipelineRun }) {
  const [logsOpen, setLogsOpen] = useState(false)

  return (
    <div className="flex flex-col bg-muted-foreground/15">
      <div className="grid grid-cols-3 divide-x">
        <div className="flex h-25 flex-col gap-3 p-2">
          <SectionTitle>Chart Screenshot</SectionTitle>
        </div>
        <div className="flex h-25 flex-col gap-3 p-2">
          <SectionTitle>Signal * Analysis</SectionTitle>
        </div>
        <div className="flex h-25 flex-col gap-3 p-2">
          <SectionTitle>Decision * Result</SectionTitle>
        </div>
      </div>
      <div className="flex flex-col p-2 border-t border-border">
        <button
          onClick={() => setLogsOpen((v) => !v)}
          className="self-start text-xs font-semibold tracking-widest text-muted-foreground hover:text-foreground"
        >
          {logsOpen ? '− Hide raw logs' : '+ View raw logs'} ({run.logs.length})
        </button>
        {logsOpen && <div className="p-2"/>}
      </div>
    </div>
  )
}

export default PipelineRunDetails
