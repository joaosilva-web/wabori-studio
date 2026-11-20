import { useEffect, type RefObject } from 'react'
import { observeOnce } from '../lib/reveal'

/**
 * Revela uma vez. Com `children: true`, cada filho direto entra em sequência
 * (80 ms entre irmãos, no máximo 8 passos); o filho precisa de data-rv no JSX
 * para já sair escondido no HTML pré-renderizado.
 */
export function useReveal(ref: RefObject<HTMLElement | null>, { children = false } = {}) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const targets = children ? [...el.children].filter((c) => c.hasAttribute('data-rv')) : [el]
    targets.forEach((t, i) => {
      if (children) (t as HTMLElement).style.setProperty('--i', String(Math.min(i, 8)))
    })
    const stops = targets.map((t) => observeOnce(t))
    return () => stops.forEach((s) => s())
  }, [ref, children])
}
