import { useRef } from 'react'
import { content, pad2 } from '../content'
import { useReveal } from '../hooks/useReveal'
import styles from './ProcessRail.module.css'

type Props = { headingLevel?: 'h3' | 'h4' }

/**
 * As 5 etapas num trilho horizontal com fio de ligação.
 * Desktop: cinco colunas. Celular: o trilho rola na horizontal, com encaixe por etapa.
 */
export function ProcessRail({ headingLevel: H = 'h3' }: Props) {
  const ref = useRef<HTMLOListElement>(null)
  useReveal(ref, { children: true })
  const steps = content.process.steps

  return (
    <ol ref={ref} className={styles.rail} tabIndex={0} aria-label={content.process.title.join(' ')}>
      {steps.map((s, i) => (
        <li key={s.title} className={styles.step} data-rv="">
          <span className={styles.num} aria-hidden="true">
            {pad2(i + 1)}
          </span>
          <span className={styles.dot} aria-hidden="true" />
          <H className={styles.title}>{s.title}</H>
          <p className={styles.text}>{s.short}</p>
        </li>
      ))}
    </ol>
  )
}
