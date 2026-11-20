import { useCallback, useSyncExternalStore } from 'react'

export const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
/** Prévia de foto que segue o cursor: mouse de verdade e tela larga. */
export const HOVER_DESKTOP = '(hover: hover) and (min-width: 761px)'
export const MOBILE = '(max-width: 760px)'

/** true/false para uma media query, reagindo a mudanças. No servidor, sempre false. */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    [query],
  )
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export const useReducedMotion = () => useMediaQuery(REDUCED_MOTION)
