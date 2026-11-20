import { useRef } from 'react'
import { LOOP_BACKWARD, LOOP_FORWARD, useLoopAnimation } from '../hooks/useLoopAnimation'
import styles from './Kaze.module.css'

/** Duas ondas por SVG (o dobro da largura da faixa): o loop -50% emenda sem salto. */
const WIND =
  'M0 20 C150 -2,300 42,450 20 C525 9,575 14,600 20 C750 -2,900 42,1050 20 C1125 9,1175 14,1200 20 L1200 34 C1175 28,1125 23,1050 34 C900 56,750 12,600 34 C575 28,525 23,450 34 C300 56,150 12,0 34 Z'

/** Duração de cada faixa (ms); a do meio corre em sentido contrário. */
const DURATIONS = [26000, 19000, 34000]

type Props = {
  /** sumi: sumi-2 sobre sumi · warm: kinari-2 sobre kinari. Nunca em shu, nunca sobre foto. */
  tone?: 'sumi' | 'warm'
  /** Fios washi em cima e embaixo (quando encosta em outra seção sumi). */
  bordered?: boolean
  className?: string
}

/**
 * Kaze: três faixas de vento tom sobre tom, ligando uma seção à outra.
 * Cada uma corre num ritmo; o scroll acelera e inverte (lib/scrollVelocity).
 * Decorativo; parado em movimento reduzido; pausa fora da tela.
 */
export function Kaze({ tone = 'sumi', bordered = false, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useLoopAnimation(ref, (el) =>
    [...el.querySelectorAll('svg')].map((svg, i) =>
      svg.animate(i === 1 ? LOOP_BACKWARD : LOOP_FORWARD, {
        duration: DURATIONS[i % 3],
        iterations: Infinity,
      }),
    ),
  )

  return (
    <div
      ref={ref}
      className={`${styles.kaze} ${styles[tone]} ${bordered ? styles.bordered : ''} ${className ?? ''}`}
      aria-hidden="true"
    >
      {DURATIONS.map((d) => (
        <div key={d} className={styles.row}>
          <svg viewBox="0 0 1200 40" preserveAspectRatio="none" focusable="false">
            <path d={WIND} />
          </svg>
        </div>
      ))}
    </div>
  )
}
