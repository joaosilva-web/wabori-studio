import { useEffect, type RefObject } from 'react'

const FRAME = 1000 / 60

/**
 * Faz `el` (absoluto dentro de `area`) seguir o cursor no eixo Y com lerp, enquanto
 * o ponteiro está sobre a área. Escreve só `translate`; o rAF roda só durante o movimento.
 * O centro vertical do elemento fica na altura do cursor, sem sair da área.
 */
export function useFollowY(
  elRef: RefObject<HTMLElement | null>,
  areaRef: RefObject<HTMLElement | null>,
  { enabled, lerp = 0.15 }: { enabled: boolean; lerp?: number },
) {
  useEffect(() => {
    const el = elRef.current
    const area = areaRef.current
    if (!enabled || !el || !area) return

    let target = 0
    let y = 0
    let raf = 0
    let last = 0
    let fresh = true

    const tick = (now: number) => {
      const f = last ? Math.min((now - last) / FRAME, 4) : 1
      last = now
      y += (target - y) * (1 - Math.pow(1 - lerp, f))
      const settled = Math.abs(target - y) < 0.1
      if (settled) y = target
      el.style.translate = `0 ${y.toFixed(1)}px`
      raf = settled ? 0 : requestAnimationFrame(tick)
      if (!raf) last = 0
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const r = area.getBoundingClientRect()
      const h = el.offsetHeight
      target = Math.max(0, Math.min(r.height - h, e.clientY - r.top - h / 2))
      if (fresh) {
        // nasce na altura do cursor em vez de viajar de onde parou
        y = target
        fresh = false
      }
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const onLeave = () => {
      fresh = true
    }

    area.addEventListener('pointermove', onMove, { passive: true })
    area.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      area.removeEventListener('pointermove', onMove)
      area.removeEventListener('pointerleave', onLeave)
      el.style.removeProperty('translate')
    }
  }, [elRef, areaRef, enabled, lerp])
}
