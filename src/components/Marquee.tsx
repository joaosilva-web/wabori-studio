import { Fragment, useRef } from 'react'
import { LOOP_FORWARD, useLoopAnimation } from '../hooks/useLoopAnimation'
import { WaboriSymbol } from './Symbol'
import styles from './Marquee.module.css'

type Props = {
  items: readonly string[]
  /** Frase lida por leitores de tela no lugar da faixa. */
  label: string
}

/**
 * Faixa em shu: texto washi em Mincho 900, separado pelo símbolo washi.
 * Duas cópias e translateX 0 → -50% em 24 s; o scroll acelera e inverte.
 */
export function Marquee({ items, label }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useLoopAnimation(ref, (el) => {
    const track = el.firstElementChild as HTMLElement
    return [track.animate(LOOP_FORWARD, { duration: 24000, iterations: Infinity })]
  })

  return (
    <div className={styles.marquee} data-tone="primary">
      <p className="sr-only">{label}</p>
      <div ref={ref} className={styles.viewport} aria-hidden="true">
        <div className={styles.track}>
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
        </div>
      </div>
    </div>
  )
}
