import { useSyncExternalStore } from "react"

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const

export type Breakpoint = keyof typeof breakpoints

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener("change", onChange)
      return () => mql.removeEventListener("change", onChange)
    },
    () => window.matchMedia(query).matches,
    () => false
  )
}

export function useBreakpoint(bp: Breakpoint) {
  return useMediaQuery(`(min-width: ${breakpoints[bp]}px)`)
}

export const useIsMobile = () => !useBreakpoint('sm')
