import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { content } from '../content'
import { HOVER_DESKTOP, useMediaQuery, useReducedMotion } from '../hooks/useMediaQuery'
import { useScrollProgress } from '../hooks/useScrollProgress'
import { PHOTO_SIZES } from '../lib/images'
import { scrollToTarget } from '../lib/smoothScroll'
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
 * Com mouse, o trilho pode ser arrastado (cursor "Arrastar"): preso, o arrasto move o scroll
 * da página (1:1 com o trilho); solto, move a rolagem horizontal do próprio trilho.
 * Um contador grande em Dela Gothic One fica preso no canto enquanto a seção está presa.
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

  // Arrastar o trilho com o mouse
  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    let startX = 0
    let start = 0
    let dragging = false
    let moved = false
    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      dragging = true
      moved = false
      startX = e.clientX
      start = moving ? window.scrollY : rail.scrollLeft
      rail.setPointerCapture(e.pointerId)
    }
    const move = (e: PointerEvent) => {
      if (!dragging) return
      const dx = e.clientX - startX
      if (Math.abs(dx) > 3) moved = true
      if (moving) scrollToTarget(start - dx, { immediate: true })
      else rail.scrollLeft = start - dx
    }
    const up = (e: PointerEvent) => {
      dragging = false
      if (rail.hasPointerCapture(e.pointerId)) rail.releasePointerCapture(e.pointerId)
    }
    const click = (e: MouseEvent) => {
      if (moved) e.preventDefault()
    }
    const noGhost = (e: DragEvent) => e.preventDefault()
    rail.addEventListener('pointerdown', down)
    rail.addEventListener('pointermove', move)
    rail.addEventListener('pointerup', up)
    rail.addEventListener('pointercancel', up)
    rail.addEventListener('click', click, true)
    rail.addEventListener('dragstart', noGhost)
    return () => {
      rail.removeEventListener('pointerdown', down)
      rail.removeEventListener('pointermove', move)
      rail.removeEventListener('pointerup', up)
      rail.removeEventListener('pointercancel', up)
      rail.removeEventListener('click', click, true)
      rail.removeEventListener('dragstart', noGhost)
    }
  }, [moving])

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

        {moving && (
          <p className={styles.bigCounter} aria-hidden="true">
            <span className={styles.bigNow}>{String(active + 1).padStart(2, '0')}</span>
            <span className={styles.bigTotal}>/ {String(total).padStart(2, '0')}</span>
          </p>
        )}

        <ol
          ref={railRef}
          className={styles.rail}
          tabIndex={pinned ? undefined : 0}
          aria-label={t.sessions}
          data-cursor="drag"
        >
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
