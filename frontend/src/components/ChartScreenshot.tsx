import { useState } from 'react'

import { getChartImageUrl } from '@/api/chartImage'
import LoadingDots from '@/components/LoadingDots'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { abbreviateFileName } from '@/lib/formatters'

function ChartScreenshot({ blobName }: { blobName: string | null }) {
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [open, setOpen] = useState(false)

  const hasImage = blobName && !error

  return (
    <div className="flex flex-1 flex-col gap-1 w-full">
      <div
        className={`flex h-40 items-center justify-center border border-dashed border-muted-foreground overflow-hidden${hasImage ? ' cursor-zoom-in' : ''}`}
        onClick={() => hasImage && loaded && setOpen(true)}
      >
        {hasImage
          ? <>
              {!loaded && <LoadingDots label="Loading" className="text-xs text-muted-foreground" />}
              <img
                src={getChartImageUrl(blobName)}
                alt="Chart screenshot"
                className={`h-full w-full object-contain${loaded ? '' : ' hidden'}`}
                onLoad={() => setLoaded(true)}
                onError={() => setError(true)}
              />
            </>
          : <span className="text-xs text-muted-foreground">{blobName ? 'Not found' : 'Not exist'}</span>
        }
      </div>
      {blobName && (
        <Tooltip delayDuration={600}>
          <TooltipTrigger asChild>
            <span className="w-fit text-xs text-muted-foreground">{abbreviateFileName(blobName)}</span>
          </TooltipTrigger>
          <TooltipContent side="bottom">{blobName}</TooltipContent>
        </Tooltip>
      )}
      {hasImage && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            className="w-fit max-w-none sm:max-w-none p-0 bg-transparent ring-0 rounded-none gap-0 shadow-none"
          >
            <img
              src={getChartImageUrl(blobName)}
              alt="Chart screenshot"
              className="block max-w-screen max-h-screen object-contain"
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default ChartScreenshot
