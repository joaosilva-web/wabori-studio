import { useEffect, useRef, type RefObject } from 'react'

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

type Options = {
  /** Avisa quando o wrapper entra ou sai da tela (para pausar loops próprios da cena). */
  onVisible?: (visible: boolean) => void
}

/** Quanto o scroll percorre dentro do wrapper (altura do wrapper − altura do sticky). */
const travelOf = (wrapper: HTMLElement, pinned: HTMLElement) => wrapper.offsetHeight - pinned.offsetHeight
const stickyTop = (pinned: HTMLElement) => parseFloat(getComputedStyle(pinned).top) || 0

/**
 * Progresso (0 → 1) do scroll atravessando um wrapper alto com conteúdo sticky.
 * É o padrão de TODA cena presa do site (capa, manifesto, galeria, sessões, processo).
 * Listener passivo + rAF: no máximo uma leitura de layout por frame; o callback só
 * dispara quando o valor muda e quem chama decide o que fazer (normalmente uma CSS variable).
 * Com o Lenis, o scroll da janela continua disparando 'scroll', então nada muda aqui.
 */
export function useScrollProgress(
  wrapperRef: RefObject<HTMLElement | null>,
  pinnedRef: RefObject<HTMLElement | null>,
  onProgress: (p: number) => void,
  enabled = true,
  { onVisible }: Options = {},
) {
  const callback = useRef(onProgress)
  callback.current = onProgress
  const visibleCb = useRef(onVisible)
  visibleCb.current = onVisible

  useEffect(() => {
    const wrapper = wrapperRef.current
    const pinned = pinnedRef.current
    if (!enabled || !wrapper || !pinned) return

    let frame = 0
    let last = -1
    let visible = false

    const update = () => {
      frame = 0
      const travel = travelOf(wrapper, pinned)
      const top = wrapper.getBoundingClientRect().top - stickyTop(pinned)
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
      visibleCb.current?.(visible)
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
      visibleCb.current?.(false)
    }
  }, [wrapperRef, pinnedRef, enabled])
}

/** Posição de scroll (px, da página) em que a cena chega ao progresso p. Para réguas e atalhos. */
export function scrollYForProgress(wrapper: HTMLElement, pinned: HTMLElement, p: number) {
  const top = wrapper.getBoundingClientRect().top + window.scrollY - stickyTop(pinned)
  return top + clamp01(p) * Math.max(0, travelOf(wrapper, pinned))
}
