import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { content } from '../content'
import { HOVER_DESKTOP, useMediaQuery, useReducedMotion } from '../hooks/useMediaQuery'
import { useScrollProgress } from '../hooks/useScrollProgress'
import { PHOTO_SIZES } from '../lib/images'
import type { Project } from '../lib/projects'
import { ProjectPhoto } from './ProjectPhoto'
import styles from './SessionTrack.module.css'

type Props = {
  sessions: Project['sessionLog']
  /** Barra de metadados e título, presos junto com o trilho. */
  head: ReactNode
}

const t = content.study

/**
 * Evolução sessão por sessão. Em telas largas (com movimento liberado), a seção prende na tela
 * e o scroll vertical leva o trilho na horizontal, com contador de sessão.
 * O progresso vai para --p no sticky; o React só re-renderiza quando a sessão ativa troca.
 * No celular e com movimento reduzido: trilho com rolagem horizontal nativa.
 * Os ancestrais usam overflow-x: clip (nunca hidden) para o sticky funcionar.
 */
export function SessionTrack({ sessions, head }: Props) {
  const wide = useMediaQuery('(min-width: 900px)')
  const desktop = useMediaQuery(HOVER_DESKTOP)
  const reduced = useReducedMotion()
  const pinned = wide && desktop && !reduced && sessions.length > 1

  const wrapperRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLOListElement>(null)
  const travel = useRef(0)
  const activeRef = useRef(0)
  const [active, setActive] = useState(0)
  /** Tudo cabe na tela: não há o que percorrer, então nada prende. */
  const [fits, setFits] = useState(false)
  const total = sessions.length
  const moving = pinned && !fits

  const measure = useCallback(() => {
    const sticky = stickyRef.current
    const rail = railRef.current
    const wrapper = wrapperRef.current
    if (!sticky || !rail || !wrapper) return
    travel.current = Math.max(0, rail.scrollWidth - rail.clientWidth)
    wrapper.style.setProperty('--travel', `${travel.current}px`)
    setFits(travel.current < 2)
  }, [])

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!pinned) {
      wrapper?.style.removeProperty('--travel')
      stickyRef.current?.style.removeProperty('--p')
      activeRef.current = 0
      setActive(0)
      setFits(false)
      return
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (railRef.current) ro.observe(railRef.current)
    document.fonts?.ready.then(measure)
    return () => ro.disconnect()
  }, [pinned, measure])

  useScrollProgress(
    wrapperRef,
    stickyRef,
    (p) => {
      stickyRef.current?.style.setProperty('--p', p.toFixed(4))
      const i = Math.min(total - 1, Math.round(p * (total - 1)))
      if (i !== activeRef.current) {
        activeRef.current = i
        setActive(i)
      }
    },
    moving,
  )

  return (
    <section ref={wrapperRef} className={styles.wrapper} data-pinned={pinned || undefined} data-fits={(pinned && fits) || undefined} data-tone="light">
      <div ref={stickyRef} className={styles.sticky}>
        <div className={`container-wide ${styles.head}`}>
          {head}
          {moving ? (
            <p className={styles.counter} aria-live="polite">
              <span aria-hidden="true">{t.sessionCounter(active + 1, total)}</span>
              <span className="sr-only">{t.sessionCounterSr(active + 1, total)}</span>
            </p>
          ) : (
            <p className={styles.counter}>{content.ui.sessions(total)}</p>
          )}
        </div>

        <ol ref={railRef} className={styles.rail} tabIndex={pinned ? undefined : 0} aria-label={t.sessions}>
          {sessions.map((s, i) => (
            <li key={i} className={styles.item} data-active={(moving && i === active) || undefined}>
              <span className={`lbl ${styles.num}`}>
                {t.sessionLabel(i + 1)}
                {s.date && <span className={styles.date}> · {s.date}</span>}
              </span>
              {s.photo ? (
                <ProjectPhoto
                  image={s.photo.image}
                  placeholder={s.photo.placeholder}
                  alt={s.photo.alt}
                  state={s.photo.state}
                  framing={s.photo.framing}
                  sizes={PHOTO_SIZES.track}
                />
              ) : null}
              <p className={styles.note}>{s.note}</p>
            </li>
          ))}
          <li className={styles.end} aria-hidden="true" />
        </ol>
      </div>
    </section>
  )
}
