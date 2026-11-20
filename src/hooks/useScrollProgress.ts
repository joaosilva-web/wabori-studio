import { useEffect, useRef, type RefObject } from 'react'

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

/**
 * Progresso (0 → 1) do scroll atravessando um wrapper alto com conteúdo sticky.
 * Listener passivo + rAF: no máximo uma leitura de layout por frame; o callback só
 * dispara quando o valor muda e quem chama decide o que fazer (normalmente uma CSS variable).
 */
export function useScrollProgress(
  wrapperRef: RefObject<HTMLElement | null>,
  pinnedRef: RefObject<HTMLElement | null>,
  onProgress: (p: number) => void,
  enabled = true,
) {
  const callback = useRef(onProgress)
  callback.current = onProgress

  useEffect(() => {
    const wrapper = wrapperRef.current
    const pinned = pinnedRef.current
    if (!enabled || !wrapper || !pinned) return

    let frame = 0
    let last = -1
    let visible = false

    const update = () => {
      frame = 0
      const travel = wrapper.offsetHeight - pinned.offsetHeight
      const top = wrapper.getBoundingClientRect().top - (parseFloat(getComputedStyle(pinned).top) || 0)
      const p = travel > 0 ? clamp01(-top / travel) : 0
      if (p !== last) {
        last = p
        callback.current(p)
      }
    }
    const schedule = () => {
      if (visible && !frame) frame = requestAnimationFrame(update)
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) schedule()
    })

    io.observe(wrapper)
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      io.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [wrapperRef, pinnedRef, enabled])
}
