import { useState } from 'react'

import { getChartImageUrl } from '@/api/chartImage'
import LoadingDots from '@/components/LoadingDots'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { abbreviateBlobName } from '@/lib/formatters'

function ChartScreenshot({ blobName }: { blobName: string | null }) {
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="flex flex-1 flex-col gap-1 w-full">
      <div className="flex h-40 items-center justify-center border border-dashed border-muted-foreground overflow-hidden">
        {blobName && !error
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
          : <span className="text-xs text-muted-foreground">Screenshot not found</span>
        }
      </div>
      {blobName && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="w-fit text-xs text-muted-foreground">{abbreviateBlobName(blobName)}</span>
          </TooltipTrigger>
          <TooltipContent side="bottom">{blobName}</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

export default ChartScreenshot
