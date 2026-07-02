import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

interface LoadingDotsProps {
  label?: string
  className?: string
}

function LoadingDots({ label = 'Loading', className }: LoadingDotsProps) {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setFrame(f => (f + 1) % 4), 300)
    return () => clearInterval(interval)
  }, [])

  return (
    <span className={cn('text-xs', className)}>
      {label}
      <span className="font-mono" style={{ letterSpacing: 'calc(-2ch / 3)' }}>
        <span style={{ opacity: frame > 0 ? 1 : 0 }}>.</span>
        <span style={{ opacity: frame > 1 ? 1 : 0 }}>.</span>
        <span style={{ opacity: frame > 2 ? 1 : 0 }}>.</span>
      </span>
    </span>
  )
}

export default LoadingDots
