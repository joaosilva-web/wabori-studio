import { useEffect, useState } from 'react'
import { content } from '../content'
import { SYMBOL_VIEWBOX, SymbolDefs, useSymbolIds, WAVE_PATH } from './Symbol'
import styles from './Intro.module.css'

/** Duração mínima até a saída começar (ms desde o início da navegação). */
const MIN_MS = 2100
/** Nunca segura o site além disso, mesmo com rede lenta. */
const MAX_MS = 5000
const EXIT_MS = 900
export const INTRO_KEY = 'wabori:intro'

/**
 * Abertura em shu. O anel (washi) se desenha (stroke-dasharray 334, 1,2 s, --ease-ink),
 * a onda aparece (0,5 s) e a tela sobe (translateY -100%, 0,9 s, --ease-exit).
 * A saída espera o maior entre o carregamento real e ~2,1 s.
 * Só na primeira visita da sessão; nunca com movimento reduzido.
 *
 * Quem decide se aparece é o script inline de index.html (classe .intro / .no-intro no <html>),
 * antes da pintura — assim o HTML pré-renderizado já nasce coberto, sem piscar.
 * html[data-intro="out"] avisa o resto da página (título da capa) que a cortina está subindo.
 */
export function Intro() {
  const ids = useSymbolIds()
  const [mounted, setMounted] = useState(true)

  useEffect(() => {
    const html = document.documentElement
    if (!html.classList.contains('intro')) {
      setMounted(false)
      return
    }

    let cancelled = false
    const loaded = new Promise<void>((resolve) => {
      if (document.readyState === 'complete') resolve()
      else window.addEventListener('load', () => resolve(), { once: true })
    })
    const fonts = document.fonts?.ready ?? Promise.resolve()
    const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, Math.max(0, ms)))
    const elapsed = performance.now()

    Promise.race([Promise.all([loaded, fonts, wait(MIN_MS - elapsed)]), wait(MAX_MS - elapsed)]).then(() => {
      if (cancelled) return
      html.dataset.intro = 'out'
      try {
        sessionStorage.setItem(INTRO_KEY, '1')
      } catch {
        /* modo privado: a abertura volta na próxima visita, sem problema */
      }
      setTimeout(() => {
        html.classList.replace('intro', 'no-intro')
        setMounted(false)
      }, EXIT_MS)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!mounted) return null

  return (
    <div className={styles.intro} aria-hidden="true" data-tone="primary">
      <span className="sr-only">{content.intro.label}</span>
      <svg viewBox={SYMBOL_VIEWBOX} className={styles.symbol}>
        <SymbolDefs {...ids} />
        <g className={styles.wave} clipPath={`url(#${ids.clip})`}>
          <path fill="currentColor" mask={`url(#${ids.mask})`} d={WAVE_PATH} />
        </g>
        <circle
          className={styles.ring}
          cx="60"
          cy="60"
          r="53"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          transform="rotate(-90 60 60)"
        />
      </svg>
    </div>
  )
}
