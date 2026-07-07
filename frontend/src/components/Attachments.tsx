import { FileText, ImageOff, StickyNoteOff } from 'lucide-react'
import { type ReactElement, useState } from 'react'

import { getAttachmentText, getAttachmentUrl } from '@/api/attachment'
import LoadingDots from '@/components/LoadingDots'
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTrigger,
} from '@/components/ui/attachment'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { abbreviateFileName } from '@/lib/formatters'
import type { PipelineAttachment } from '@/models/pipelineRun'

function ImageAttachment({ blobName, url }: { blobName: string; url: string }) {
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [open, setOpen] = useState(false)

  const hasImage = !error

  const renderMedia = () => {
    if (!hasImage) return <ImageOff />
    return (
      <>
        {!loaded && <LoadingDots className="text-xs text-muted-foreground" />}
        <img src={url} hidden={!loaded} onLoad={() => setLoaded(true)} onError={() => setError(true)} />
      </>
    )
  }

  const getAttachmentState = () => {
    if (error) return 'error'
    if (!loaded) return 'processing'
    return 'done'
  }

  return (
    <>
      <Attachment orientation="vertical" state={getAttachmentState()}>
        <AttachmentMedia variant="image">
          {renderMedia()}
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentDescription>{abbreviateFileName(blobName)}</AttachmentDescription>
        </AttachmentContent>
        {hasImage && loaded && <AttachmentTrigger onClick={() => setOpen(true)} className="cursor-zoom-in" />}
      </Attachment>
      {hasImage && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="w-fit max-w-none sm:max-w-none p-0 bg-transparent ring-0 rounded-none gap-0 shadow-none">
            <img src={url} className="block max-w-screen max-h-screen object-contain" />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

function TextAttachment({ blobName, fetchText }: { blobName: string; fetchText: () => Promise<string> }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const handleOpen = () => {
    if (loading) return
    if (text !== null) {
      setOpen(true)
      return
    }

    setLoading(true)
    fetchText()
      .then((loadedText) => {
        setText(loadedText)
        setLoading(false)
        setOpen(true)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }

  const renderMedia = () => {
    if (error) return <StickyNoteOff />
    if (loading) return <LoadingDots className="text-xs text-muted-foreground" />
    return <FileText />
  }

  const getAttachmentState = () => {
    if (error) return 'error'
    if (loading) return 'processing'
    return 'done'
  }

  return (
    <>
      <Attachment orientation="vertical" state={getAttachmentState()}>
        <AttachmentMedia variant="image">
          {renderMedia()}
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentDescription>{abbreviateFileName(blobName)}</AttachmentDescription>
        </AttachmentContent>
        {!error && ! loading && <AttachmentTrigger onClick={handleOpen} className="cursor-pointer" />}
      </Attachment>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <div className="max-h-[80vh] overflow-y-auto whitespace-pre-wrap">{text}</div>
        </DialogContent>
      </Dialog>
    </>
  )
}

type AttachmentRenderer = (blobName: string) => ReactElement
type AttachmentRenderMap = Record<PipelineAttachment['type'], AttachmentRenderer>

const renderMap: AttachmentRenderMap = {
  chartScreenshot: (blobName) => (
    <ImageAttachment
      key={blobName}
      blobName={blobName}
      url={getAttachmentUrl('chartScreenshot', blobName)} />
  ),
  analysisText: (blobName) => (
    <TextAttachment
      key={blobName}
      blobName={blobName}
      fetchText={() => getAttachmentText(blobName)} />
  ),
}

function Attachments({ attachments }: { attachments: PipelineAttachment[] }) {
  return (
    <AttachmentGroup>
      {attachments.map((a) => renderMap[a.type](a.blobName))}
    </AttachmentGroup>
  )
}

export default Attachments
