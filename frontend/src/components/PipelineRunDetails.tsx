import { useState } from 'react'

import Attachments from '@/components/Attachments'
import DecisionResult from '@/components/decision/DecisionResult'
import RawLogsTable from '@/components/RawLogsTable'
import SignalAnalysis from '@/components/SignalAnalysis'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useIsMobile } from '@/hooks/use-breakpoint'
import type { PipelineRun } from '@/models/pipelineRun'

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-widest text-foreground">
      {children}
    </span>
  )
}

const AttachmentsSection = ({ run }: { run: PipelineRun }) => <Attachments blobName={run.blobName} />
const AnalysisSection = ({ run }: { run: PipelineRun }) => run.signal ? <SignalAnalysis signal={run.signal} /> : null
const DecisionSection = ({ run }: { run: PipelineRun }) => run.decision ? <DecisionResult decision={run.decision} /> : null

const sections = [
  { key: 'attachments', title: 'Attachments', shortTitle: 'Attachments', Component: AttachmentsSection },
  { key: 'analysis', title: 'Signal * Analysis', shortTitle: 'Analysis', Component: AnalysisSection },
  { key: 'decision', title: 'Decision * Result', shortTitle: 'Decision', Component: DecisionSection },
]

function PipelineRunDetails({ run }: { run: PipelineRun }) {
  const [logsOpen, setLogsOpen] = useState(false)
  const isMobile = useIsMobile()

  const logsButtonLabel = (() => {
    switch (true) {
      case logsOpen: return `- Hide raw logs (${run.logs.length})`
      case run.logs.length === 0: return 'No raw logs'
      default: return `+ View raw logs (${run.logs.length})`
    }
  })()

  return (
    <div className="whitespace-normal">
      {isMobile ? (
        <Tabs defaultValue="decision" className="p-2">
          <TabsList variant="line">
            {sections.map(({ key, shortTitle }) => (
              <TabsTrigger key={key} value={key}>{shortTitle}</TabsTrigger>
            ))}
          </TabsList>
          {sections.map(({ key, Component }) => (
            <TabsContent key={key} value={key}>
              <Component run={run} />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="grid grid-cols-3 divide-x">
          {sections.map(({ key, title, Component }) => (
            <div key={key} className="flex min-w-0 flex-col gap-3 p-2">
              <SectionTitle>{title}</SectionTitle>
              <Component run={run} />
            </div>
          ))}
        </div>
      )}
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
