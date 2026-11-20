import { useEffect, useRef, type RefObject } from 'react'
import { registerLoop, type VelocityFrame } from '../lib/scrollVelocity'
import { useReducedMotion } from './useMediaQuery'

/**
 * Cria animações em loop (Web Animations API) no elemento e liga ao controle
 * de velocidade do scroll. Pausam fora da tela; com movimento reduzido, nem existem.
 * onFrame (opcional) recebe a cada frame o rate e a intensidade (0 → 1) do scroll,
 * no mesmo loop do scrollVelocity — para efeitos que não são playbackRate (amplitude, skew).
 */
export function useLoopAnimation(
  ref: RefObject<HTMLElement | null>,
  build: (el: HTMLElement) => Animation[],
  onFrame?: (el: HTMLElement, f: VelocityFrame) => void,
) {
  const reduced = useReducedMotion()
  const buildRef = useRef(build)
  buildRef.current = build
  const frameRef = useRef(onFrame)
  frameRef.current = onFrame

  useEffect(() => {
    const el = ref.current
    if (!el || reduced || typeof el.animate !== 'function') return

    const loop = registerLoop(buildRef.current(el), frameRef.current ? (f) => frameRef.current?.(el, f) : undefined)
    const io = new IntersectionObserver(([entry]) => loop.setVisible(entry.isIntersecting), {
      rootMargin: '100px 0px',
    })
    io.observe(el)
    return () => {
      io.disconnect()
      loop.dispose()
    }
  }, [ref, reduced])
}

/** Keyframes do loop: 0 → -50% (duas cópias lado a lado emendam sem salto). */
export const LOOP_FORWARD: Keyframe[] = [{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }]
export const LOOP_BACKWARD: Keyframe[] = [{ transform: 'translateX(-50%)' }, { transform: 'translateX(0)' }]
