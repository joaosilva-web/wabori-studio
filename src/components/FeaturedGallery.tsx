import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import { Link } from 'react-router'
import { content, pad2, sectionPath } from '../content'
import { useReducedMotion } from '../hooks/useMediaQuery'
import { useScrollProgress } from '../hooks/useScrollProgress'
import { PHOTO_SIZES } from '../lib/images'
import type { Project } from '../lib/projects'
import { ProjectPhoto } from './ProjectPhoto'
import { WaboriSymbol } from './Symbol'
import styles from './FeaturedGallery.module.css'

type Props = {
  projects: readonly Project[]
  /** Barra de metadados, título e link, presos junto com o trilho. */
  head: ReactNode
}

const t = content.home.featured
const ui = content.ui
const WIDE = '(min-width: 761px)'

/**
 * Cena 7 — projetos em galeria horizontal. Seção presa (300 vh): o scroll vertical leva
 * os cartões 4:5 na horizontal (--p e --travel no sticky, sem re-render). Termina num
 * cartão "Ver todos os projetos". O cursor vira o anel "Ver" sobre os cartões (data-cursor).
 * Celular e movimento reduzido: carrossel nativo com scroll-snap, nada preso (no CSS).
 */
export function FeaturedGallery({ projects, head }: Props) {
  const reduced = useReducedMotion()
  const wrapperRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLOListElement>(null)

  const measure = useCallback(() => {
    const track = trackRef.current
    const sticky = stickyRef.current
    if (!track || !sticky) return
    const last = track.lastElementChild as HTMLElement | null
    if (!last) return
    // pela borda do último cartão (o scrollWidth não conta o padding final do flex);
    // o transform move os dois retângulos juntos, então a diferença não depende dele
    const padEnd = parseFloat(getComputedStyle(track).paddingRight) || 0
    const overflow = last.getBoundingClientRect().right - track.getBoundingClientRect().right + padEnd
    const travel = window.matchMedia(WIDE).matches ? Math.max(0, overflow) : 0
    sticky.style.setProperty('--travel', `${travel}px`)
  }, [])

  useEffect(() => {
    if (reduced) return
    measure()
    const ro = new ResizeObserver(measure)
    if (trackRef.current) ro.observe(trackRef.current)
    document.fonts?.ready.then(measure)
    return () => ro.disconnect()
  }, [reduced, measure])

  useScrollProgress(
    wrapperRef,
    stickyRef,
    (p) => stickyRef.current?.style.setProperty('--p', p.toFixed(4)),
    !reduced,
  )

  return (
    <section ref={wrapperRef} className={styles.gallery} data-tone="light" aria-labelledby="destaques-titulo">
      <div ref={stickyRef} className={styles.sticky}>
        <div className={`container-wide ${styles.head}`}>{head}</div>

        <ol ref={trackRef} className={styles.track} aria-label={t.galleryLabel}>
          {projects.map((p, i) => {
            const photo = p.photos[0]
            return (
              <li key={p.slug} className={styles.item}>
                <Link to={p.href} className={styles.card} data-cursor="view">
                  <ProjectPhoto
                    image={photo?.image}
                    placeholder={photo?.placeholder}
                    alt={photo?.alt ?? p.title}
                    state={photo?.state}
                    sizes={PHOTO_SIZES.gallery}
                  />
                  <span className={styles.meta}>
                    <span className={styles.num}>{pad2(i + 1)}</span>
                    <span className="lbl">{p.areaLabel}</span>
                    <span className={`lbl ${styles.sessions}`}>{ui.sessions(p.sessions)}</span>
                  </span>
                  <h3 className={styles.title}>{p.title}</h3>
                </Link>
              </li>
            )
          })}
          <li className={styles.item}>
            <Link to={sectionPath.projetos} className={`${styles.card} ${styles.all}`} data-tone="primary">
              <WaboriSymbol size={44} />
              <span className={styles.allText}>
                {t.allCard.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </span>
              <span className={styles.allArrow} aria-hidden="true">
                {ui.arrow}
              </span>
            </Link>
          </li>
        </ol>
      </div>
    </section>
  )
}
