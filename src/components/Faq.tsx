import { useRef } from 'react'
import { pad2 } from '../content'
import { useReveal } from '../hooks/useReveal'
import styles from './Faq.module.css'

export type FaqItem = { q: string; a: string | readonly string[] }

type Props = {
  items: readonly FaqItem[]
  /** Nível do título de cada pergunta (dentro do <summary>). */
  headingLevel?: 'h3' | 'h4'
  className?: string
}

/**
 * Acordeão com <details>/<summary>: teclado (Enter/Espaço) e leitores de tela nativos.
 * Número de dois dígitos à esquerda; o "+" gira 45° quando abre.
 */
export function Faq({ items, headingLevel: H = 'h3', className }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  useReveal(ref, { children: true })
  return (
    <div ref={ref} className={`${styles.faq} ${className ?? ''}`}>
      {items.map((item, i) => (
        <details key={item.q} className={styles.item} data-rv="">
          <summary className={styles.summary}>
            <span className={styles.number} aria-hidden="true">
              {pad2(i + 1)}
            </span>
            <H className={styles.question}>{item.q}</H>
            <span className={styles.plus} aria-hidden="true">
              +
            </span>
          </summary>
          <div className={styles.answer}>
            {(typeof item.a === 'string' ? [item.a] : item.a).map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </details>
      ))}
    </div>
  )
}
