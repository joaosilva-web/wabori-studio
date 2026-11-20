import { useEffect, useState } from 'react'
import { content } from '../content'
import { CARVE_PATH, SYMBOL_VIEWBOX, useSymbolIds, WAVE_LINE, WAVE_PATH } from './Symbol'
import styles from './Intro.module.css'

/** O símbolo termina de ser feito em ~2,4 s (ms desde o início da navegação). */
const MIN_MS = 2400
/** Nunca segura o site além disso, mesmo com rede lenta. */
const MAX_MS = 5000
/** Duração da íris (CSS). */
const IRIS_MS = 900
const SHORT_MS = 700
export const INTRO_KEY = 'wabori:intro'

/**
 * Cena 1 — abertura: o símbolo é tatuado. Sobre shu, em washi, nas três etapas reais:
 *   1. sujibori — o contorno da onda com garras se desenha como traço (1,1 s, --ease-ink);
 *   2. bokashi — o preenchimento sobe de baixo para cima (0,6 s) e a linha entalhada aparece por último;
 *   3. mikiri — o anel se fecha em volta (0,8 s).
 * Depois o anel cresce até virar uma íris que se abre e revela a capa (o pôster do contorno).
 * Espera o carregamento real (mínimo ~2,4 s), só na primeira visita da sessão.
 * Visitas seguintes: só a íris, 0,6 s (CSS puro). Nunca com movimento reduzido.
 *
 * Quem decide é o script inline de index.html (classe .intro / .intro-short / .no-intro no <html>),
 * antes da pintura — o HTML pré-renderizado já nasce coberto, sem piscar.
 * html[data-intro="out"] avisa o resto da página (título da capa, vídeo) que a íris está abrindo.
 */
export function Intro() {
  const ids = useSymbolIds()
  const [mounted, setMounted] = useState(true)

  useEffect(() => {
    const html = document.documentElement
    const finish = () => {
      html.classList.remove('intro', 'intro-short')
      html.classList.add('no-intro')
      setMounted(false)
    }

    if (html.classList.contains('intro-short')) {
      const id = setTimeout(finish, SHORT_MS)
      return () => clearTimeout(id)
    }
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
      setTimeout(finish, IRIS_MS)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!mounted) return null

  return (
    <div className={styles.intro} aria-hidden="true">
      <span className="sr-only">{content.intro.label}</span>
      <span className={styles.iris} />
      <svg viewBox={SYMBOL_VIEWBOX} className={styles.symbol}>
        <defs>
          <clipPath id={ids.clip}>
            <circle cx="60" cy="60" r="50" />
          </clipPath>
        </defs>
        <g clipPath={`url(#${ids.clip})`}>
          {/* 2. bokashi: o preenchimento sobe */}
          <path className={styles.fill} fill="currentColor" d={WAVE_PATH} />
          {/* 1. sujibori: o contorno como traço */}
          <path className={styles.line} d={WAVE_LINE} pathLength={1} />
          {/* a linha entalhada, por último (na cor do fundo, como a máscara do símbolo) */}
          <path className={styles.carve} d={CARVE_PATH} pathLength={1} />
        </g>
        {/* 3. mikiri: o anel se fecha */}
        <circle className={styles.ring} cx="60" cy="60" r="53" pathLength={1} transform="rotate(-90 60 60)" />
      </svg>
    </div>
  )
}
