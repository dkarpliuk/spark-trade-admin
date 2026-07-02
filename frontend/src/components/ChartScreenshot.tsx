import { ImageOff } from 'lucide-react'
import { useState } from 'react'

import { getChartImageUrl } from '@/api/chartImage'
import LoadingDots from '@/components/LoadingDots'
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTrigger,
} from '@/components/ui/attachment'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { abbreviateFileName } from '@/lib/formatters'

function ChartScreenshot({ blobName }: { blobName: string | null }) {
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [open, setOpen] = useState(false)

  const hasImage = !!blobName && !error

  const getMedia = () => {
    if (!hasImage) return <ImageOff />
    return <>
      {!loaded && <LoadingDots className="text-xs text-muted-foreground" />}
      <img
        src={getChartImageUrl(blobName)}
        hidden={!loaded}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </>
  }

  return (
    <>
      <Attachment orientation="vertical">
        <AttachmentMedia variant="image">
          {getMedia()}
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentDescription>{blobName ? abbreviateFileName(blobName) : 'No screenshot'}</AttachmentDescription>
        </AttachmentContent>
        {hasImage && loaded && <AttachmentTrigger onClick={() => setOpen(true)} className="cursor-zoom-in" />}
      </Attachment>
      {hasImage && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="w-fit max-w-none sm:max-w-none p-0 bg-transparent ring-0 rounded-none gap-0 shadow-none">
            <img src={getChartImageUrl(blobName)} className="block max-w-screen max-h-screen object-contain" />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

export default ChartScreenshot
