import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

const DOT_FRAMES = ['', '.', '..', '...']

interface LoadingDotsProps {
  label?: string
  className?: string
}

function LoadingDots({ label = 'Loading', className }: LoadingDotsProps) {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((current) => (current + 1) % DOT_FRAMES.length)
    }, 400)
    return () => clearInterval(interval)
  }, [])

  return (
    <span className={cn('text-sm font-medium', className)}>
      {label}
      {DOT_FRAMES[frame]}
    </span>
  )
}

export default LoadingDots
