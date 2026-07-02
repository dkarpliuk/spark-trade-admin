import ChartScreenshot from '@/components/ChartScreenshot'
import { AttachmentGroup } from '@/components/ui/attachment'

function Attachments({ blobName }: { blobName: string | null }) {
  return (
    <AttachmentGroup>
      <ChartScreenshot blobName={blobName} />
    </AttachmentGroup>
  )
}

export default Attachments
