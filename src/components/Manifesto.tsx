import { useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { pad2, type SectionId } from '../content'
import { useReducedMotion } from '../hooks/useMediaQuery'
import { useScrollProgress } from '../hooks/useScrollProgress'
import { SectionMeta } from './SectionMeta'
import { WAVE_LINE } from './Symbol'
import styles from './Manifesto.module.css'

type Pillar = { title: string; text: string }

type Props = {
  section: SectionId
  label: string
  aside?: ReactNode
  /** Título da seção (h2), discreto, acima do texto. */
  heading: string
  /** O texto que se acende palavra por palavra. */
  text: string
  /** Três pilares que entram no fim (só no manifesto da home). */
  pillars?: readonly Pillar[]
  /** long = 250 vh, com anel e pilares · short = 160 vh, só texto e onda. */
  size?: 'long' | 'short'
  /** Conteúdo extra abaixo do texto (ex.: nome do artista). */
  children?: ReactNode
}

/**
 * Cena 4 — manifesto. Seção sumi presa: o texto passa de nezumi-claro a 25% para washi cheio,
 * palavra por palavra, conforme o scroll; ao fundo, enorme, a linha da onda do símbolo
 * (o contorno com garras) se desenha em sumi-2. No fim, o anel shu se fecha (mikiri)
 * e os pilares entram em sequência.
 *
 * Tudo sai de uma variável só (--p, escrita pelo useScrollProgress) e de calc() no CSS;
 * o React só re-renderiza quando os pilares entram. Movimento reduzido: nada preso,
 * texto aceso, onda e anel completos (no CSS).
 */
export function Manifesto({ section, label, aside, heading, text, pillars, size = 'long', children }: Props) {
  const reduced = useReducedMotion()
  const wrapperRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const [done, setDone] = useState(false)
  const doneRef = useRef(false)
  const titleId = useId()
  const words = text.split(/\s+/)

  useScrollProgress(
    wrapperRef,
    stickyRef,
    (p) => {
      stickyRef.current?.style.setProperty('--p', p.toFixed(4))
      const d = p >= 0.84
      if (d !== doneRef.current) setDone((doneRef.current = d))
    },
    !reduced,
  )

  return (
    <section
      ref={wrapperRef}
      className={styles.manifesto}
      data-size={size}
      data-tone="dark"
      aria-labelledby={titleId}
    >
      <div ref={stickyRef} className={styles.sticky} data-done={done || undefined}>
        <svg className={styles.wave} viewBox="-6 22 132 74" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
          <path d={WAVE_LINE} pathLength={1} />
        </svg>
        {size === 'long' && (
          <svg className={styles.ring} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
            <circle cx="60" cy="60" r="56" pathLength={1} transform="rotate(-90 60 60)" />
          </svg>
        )}

        <div className={`container ${styles.inner}`}>
          <SectionMeta section={section} label={label} aside={aside} />
          <h2 id={titleId} className={`lbl ${styles.heading}`}>
            {heading}
          </h2>

          <div className={styles.stage}>
            <p className={styles.text} style={{ '--n': words.length } as CSSProperties}>
              <span className="sr-only">{text}</span>
              <span aria-hidden="true">
                {words.map((w, i) => (
                  <span key={i} className={styles.word} style={{ '--i': i } as CSSProperties}>
                    {w}{' '}
                  </span>
                ))}
              </span>
            </p>
            {children}

            {pillars && (
              <ul className={styles.pillars}>
                {pillars.map((p, i) => (
                  <li key={p.title} className={styles.pillar} style={{ '--i': i } as CSSProperties}>
                    <span className={`lbl ${styles.pillarNum}`}>{pad2(i + 1)}</span>
                    <h3 className={styles.pillarTitle}>{p.title}</h3>
                    <p>{p.text}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
