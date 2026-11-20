import { useEffect, type RefObject } from 'react'
import { useReducedMotion } from './useMediaQuery'

type Options = {
  /** p = 0 quando o TOPO do elemento chega a esta fração da altura da tela. */
  start?: number
  /** p = 1 quando o FUNDO do elemento chega a esta fração da altura da tela. */
  end?: number
  varName?: string
  /** Valor fixo com movimento reduzido. */
  reducedValue?: number
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

/**
 * Progresso (0 → 1) de um elemento atravessando a tela, escrito como CSS variable.
 * Listener passivo + rAF, uma leitura de layout por frame, só enquanto visível. Sem re-render.
 */
export function useViewProgress(
  ref: RefObject<HTMLElement | null>,
  { start = 0.85, end = 0.45, varName = '--p', reducedValue = 1 }: Options = {},
) {
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduced) {
      el.style.setProperty(varName, String(reducedValue))
      return () => el.style.removeProperty(varName)
    }

    let frame = 0
    let last = ''
    let visible = false

    const update = () => {
      frame = 0
      const vh = window.innerHeight
      const r = el.getBoundingClientRect()
      const travel = (start - end) * vh + r.height
      const p = travel > 0 ? clamp01((start * vh - r.top) / travel) : 1
      const value = p.toFixed(4)
      if (value !== last) {
        last = value
        el.style.setProperty(varName, value)
      }
    }
    const schedule = () => {
      if (visible && !frame) frame = requestAnimationFrame(update)
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) schedule()
    })

    io.observe(el)
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      io.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      el.style.removeProperty(varName)
    }
  }, [ref, start, end, varName, reducedValue, reduced])
}
