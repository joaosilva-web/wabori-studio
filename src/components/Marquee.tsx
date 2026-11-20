import { Fragment, useRef } from 'react'
import { LOOP_BACKWARD, LOOP_FORWARD, useLoopAnimation } from '../hooks/useLoopAnimation'
import { WaboriSymbol } from './Symbol'
import styles from './Marquee.module.css'

type Props = {
  items: readonly string[]
  /** Frase lida por leitores de tela no lugar da faixa. */
  label: string
}

/** Inclinação máxima (graus) com a rolagem mais rápida. */
const MAX_SKEW = 8

/**
 * Cena 5 — faixa em shu com inércia: duas linhas de texto washi em Mincho 900, separadas
 * pelo símbolo, correndo em sentidos opostos (24 s e 30 s). O scroll acelera e inverte;
 * além disso, as linhas inclinam (skewX até 8°) na proporção da velocidade e voltam a 0
 * com suavidade quando a rolagem para. Tudo no loop do scrollVelocity, sem React.
 */
export function Marquee({ items, label }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const lastSkew = useRef(0)

  useLoopAnimation(
    ref,
    (el) =>
      [...el.querySelectorAll<HTMLElement>('[data-track]')].map((track, i) =>
        track.animate(i === 0 ? LOOP_FORWARD : LOOP_BACKWARD, { duration: i === 0 ? 24000 : 30000, iterations: Infinity }),
      ),
    (el, { rate, intensity }) => {
      const skew = Math.round(-Math.sign(rate) * intensity * MAX_SKEW * 100) / 100
      if (skew === lastSkew.current) return
      lastSkew.current = skew
      el.style.setProperty('--skew', `${skew}deg`)
    },
  )

  const row = (
    <>
      {[0, 1].map((copy) => (
        <span key={copy} className={styles.group}>
          {items.map((item) => (
            <Fragment key={item}>
              <span>{item}</span>
              <WaboriSymbol className={styles.sep} size=".62em" />
            </Fragment>
          ))}
        </span>
      ))}
    </>
  )

  return (
    <div className={styles.marquee} data-tone="primary">
      <p className="sr-only">{label}</p>
      <div ref={ref} className={styles.viewport} aria-hidden="true">
        <div className={styles.line}>
          <div className={styles.track} data-track="">
            {row}
          </div>
        </div>
        <div className={`${styles.line} ${styles.second}`}>
          <div className={styles.track} data-track="">
            {row}
          </div>
        </div>
      </div>
    </div>
  )
}
