import { useRef } from 'react'
import { LOOP_BACKWARD, LOOP_FORWARD, useLoopAnimation } from '../hooks/useLoopAnimation'
import styles from './Kaze.module.css'

/** Duas ondas por SVG (o dobro da largura da faixa): o loop -50% emenda sem salto. */
const WIND =
  'M0 20 C150 -2,300 42,450 20 C525 9,575 14,600 20 C750 -2,900 42,1050 20 C1125 9,1175 14,1200 20 L1200 34 C1175 28,1125 23,1050 34 C900 56,750 12,600 34 C575 28,525 23,450 34 C300 56,150 12,0 34 Z'

/**
 * A mesma onda com mais amplitude: exatamente os mesmos comandos e pontos, só os y mudam
 * (afastados do eixo de cada borda: 20 em cima, 34 embaixo). Interpolada pela intensidade.
 */
const AMPLIFY = 1.7
const parts = WIND.split(/([MCLZ])/).filter(Boolean)
const nums = WIND.match(/-?\d+(\.\d+)?/g)!.map(Number)
/** Onde começa a borda de baixo: o "L1200 34" (o segundo x = 1200 da lista). */
const BOTTOM_START = nums.indexOf(1200, nums.indexOf(1200) + 1)
const calm = nums
const wild = nums.map((n, i) => {
  if (i % 2 === 0) return n // x não muda
  const axis = i < BOTTOM_START ? 20 : 34
  return axis + (n - axis) * AMPLIFY
})

function windPath(k: number) {
  let j = 0
  return parts
    .map((p) =>
      /^[MCLZ]$/.test(p)
        ? p
        : p.replace(/-?\d+(\.\d+)?/g, () => {
            const v = calm[j] + (wild[j] - calm[j]) * k
            j++
            return String(Math.round(v * 10) / 10)
          }),
    )
    .join('')
}

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
 * Cena 3 — Kaze reativo: três faixas de vento tom sobre tom, ligando uma seção à outra.
 * Cada uma corre num ritmo; o scroll acelera e inverte (lib/scrollVelocity) e, quanto mais
 * rápido, maior a amplitude da onda — que volta a se acalmar quando a rolagem para.
 * O atributo d é escrito no mesmo loop do scrollVelocity, sem React.
 * Decorativo; parado em movimento reduzido; pausa fora da tela.
 */
export function Kaze({ tone = 'sumi', bordered = false, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const lastK = useRef(-1)

  useLoopAnimation(
    ref,
    (el) =>
      [...el.querySelectorAll('svg')].map((svg, i) =>
        svg.animate(i === 1 ? LOOP_BACKWARD : LOOP_FORWARD, {
          duration: DURATIONS[i % 3],
          iterations: Infinity,
        }),
      ),
    (el, { intensity }) => {
      const k = Math.round(intensity * 100) / 100
      if (k === lastK.current) return
      lastK.current = k
      const d = windPath(k)
      el.querySelectorAll('path').forEach((p) => p.setAttribute('d', d))
    },
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
