import { RotateCw } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RefreshButtonProps {
  isFetching: boolean
  onRefresh: () => void
}

function RefreshButton({ isFetching, onRefresh }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isFetching) setIsRefreshing(false)
  }, [isFetching])

  const handleClick = () => {
    setIsRefreshing(true)
    onRefresh()
  }

  return (
    <Button variant="ghost" size="icon-sm" disabled={isFetching} onClick={handleClick}>
      <RotateCw
        className={cn(
          'size-4 origin-center transform-fill',
          isFetching && isRefreshing && 'animate-spin',
        )}
      />
    </Button>
  )
}

export default RefreshButton
