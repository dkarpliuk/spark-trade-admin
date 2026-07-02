import { breakpoints, type Breakpoint } from "@/lib/breakpoints"
import { useMediaQuery } from "@/hooks/use-media-query"

export function useBreakpoint(bp: Breakpoint) {
  return useMediaQuery(`(min-width: ${breakpoints[bp]}px)`)
}
