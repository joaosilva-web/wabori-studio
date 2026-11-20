import { useCallback, useEffect, useRef, useState, type CSSProperties, type FocusEvent } from 'react'
import { Link } from 'react-router'
import { content, pad2, sectionPath } from '../content'
import { useMediaQuery, useReducedMotion } from '../hooks/useMediaQuery'
import { scrollYForProgress, useScrollProgress } from '../hooks/useScrollProgress'
import { useViewProgress } from '../hooks/useViewProgress'
import { PHOTO_SIZES } from '../lib/images'
import type { Project } from '../lib/projects'
import { scrollToTarget } from '../lib/smoothScroll'
import { Picture } from './Picture'
import { SectionMeta } from './SectionMeta'
import { WaboriSymbol } from './Symbol'
import { Tag } from './Tag'
import styles from './FeaturedGallery.module.css'

const t = content.home.featured
const ui = content.ui

/** Breakpoint de entrada em modo preso. */
const WIDE = '(min-width: 761px)'
/** O trilho chega ao fim em 94% do trajeto: a última etapa fica presa na tela. */
const HOLD = 0.94
const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

type Layout = {
  travel: number
  centers: number[]
  stops: number[]
  half: number
}

/**
 * Cena 7 — galeria de projetos em destaque. Linha do tempo horizontal presa (data-pinned):
 * painel de abertura + projetos como etapas, número gigante, foto 4:5, linha que se desenha
 * com marcadores do símbolo Wabori e barra de progresso inferior.
 * Mobile e movimento reduzido: lista vertical com linha que se desenha.
 * A decisão entre trilho preso e lista vertical é só do CSS: data-pinned vai no section,
 * partindo como ausente no SSR (mobile layout) e adicionado pelo JS no mount.
 */
export function FeaturedGallery({ projects }: { projects: readonly Project[] }) {
  const reduced = useReducedMotion()
  const wide = useMediaQuery(WIDE)
  const pinned = wide && !reduced

  const wrapperRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLOListElement>(null)
  const layout = useRef<Layout>({ travel: 0, centers: [], stops: [], half: 0 })
  const progress = useRef(0)
  const activeRef = useRef(0)
  const [active, setActive] = useState(0)

  const total = projects.length

  const pickActive = useCallback((p: number) => {
    const { travel, centers, half } = layout.current
    if (!centers.length) return
    let best = 0
    let bestDist = Infinity
    centers.forEach((c, i) => {
      const d = Math.abs(c - p * travel - half)
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    })
    if (best !== activeRef.current) {
      activeRef.current = best
      setActive(best)
    }
  }, [])

  const measure = useCallback(() => {
    const sticky = stickyRef.current
    const rail = railRef.current
    const list = listRef.current
    const wrapper = wrapperRef.current
    if (!sticky || !rail || !list || !wrapper) return
    const width = sticky.clientWidth
    const travel = Math.max(0, rail.scrollWidth - width)
    const railRect = rail.getBoundingClientRect()
    // base: left do trilho em p = 0 (desfaz o translate atual)
    const base = railRect.left - sticky.getBoundingClientRect().left + progress.current * travel
    const half = width / 2
    const centers = [...list.children].map((li) => {
      const r = li.getBoundingClientRect()
      return base + (r.left - railRect.left) + r.width / 2
    })
    const stops = centers.map((c) => (travel > 0 ? clamp01((c - half) / travel) : 0))
    layout.current = { travel, centers, stops, half }
    wrapper.style.setProperty('--travel', `${travel}px`)
    stops.forEach((s, i) => sticky.style.setProperty(`--stop-${i}`, s.toFixed(4)))
    pickActive(progress.current)
  }, [pickActive])

  useEffect(() => {
    if (!pinned) {
      stickyRef.current?.style.removeProperty('--p')
      wrapperRef.current?.style.removeProperty('--travel')
      progress.current = 0
      activeRef.current = 0
      setActive(0)
      return
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (stickyRef.current) ro.observe(stickyRef.current)
    if (railRef.current) ro.observe(railRef.current)
    window.addEventListener('resize', measure)
    document.fonts?.ready.then(measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [pinned, measure])

  useScrollProgress(wrapperRef, stickyRef, (raw) => {
    const p = clamp01(raw / HOLD)
    progress.current = p
    stickyRef.current?.style.setProperty('--p', p.toFixed(4))
    pickActive(p)
  }, pinned)

  // linha vertical no mobile (se desenha com o scroll da lista)
  useViewProgress(listRef, { varName: '--line', start: 0.9, end: 0.2 })

  const onFocus = (e: FocusEvent<HTMLOListElement>) => {
    if (!pinned) return
    const wrapper = wrapperRef.current
    const sticky = stickyRef.current
    const list = listRef.current
    if (!wrapper || !sticky || !list) return
    const index = [...list.children].findIndex((li) => li.contains(e.target))
    if (index < 0 || index >= layout.current.stops.length) return
    sticky.scrollLeft = 0
    scrollToTarget(scrollYForProgress(wrapper, sticky, layout.current.stops[index] * HOLD), { immediate: true })
  }

  const displayActive = Math.min(active, total - 1)

  return (
    <section
      ref={wrapperRef}
      className={styles.gallery}
      data-pinned={pinned || undefined}
      data-tone="light"
      aria-labelledby="destaques-titulo"
    >
      <div ref={stickyRef} className={styles.sticky}>
        <div className={`container-wide ${styles.meta}`}>
          <SectionMeta
            section="projetos"
            label={t.label}
            aside={
              <>
                {/* contador preso: visível só em data-pinned, aria-live anuncia troca de etapa */}
                <span className={styles.counterPinned} aria-live="polite" aria-atomic="true">
                  <span aria-hidden="true">{pad2(displayActive + 1)} / {pad2(total)}</span>
                  <span className="sr-only">{t.counterSr(displayActive + 1, total)}</span>
                </span>
                {/* contagem estática: visível só fora de data-pinned */}
                <span className={styles.counterFree}>{t.aside(total)}</span>
              </>
            }
          />
        </div>

        <div className={styles.stage}>
          <div ref={railRef} className={styles.rail}>
            <div className={styles.opening}>
              <h2 id="destaques-titulo" className={styles.openingTitle}>
                <span className="sr-only">{t.title.join(' ')}</span>
                {t.title.map((line, i) => (
                  <span key={i} aria-hidden="true">{line}</span>
                ))}
              </h2>
              {/* dica de rolagem: sempre no DOM, CSS esconde fora do modo preso */}
              <p className={styles.hint} aria-hidden="true">
                <span className={styles.hintArrow}>→</span> {t.scrollHint}
              </p>
            </div>

            <ol ref={listRef} className={styles.steps} onFocus={onFocus}>
              {projects.map((p, i) => (
                <ProjectItem
                  key={p.slug}
                  project={p}
                  index={i}
                  isActive={!pinned || i === active}
                  isDone={pinned && i < active}
                />
              ))}

              {/* painel final "Ver todos os projetos" */}
              <li className={`${styles.step} ${styles.finalStep}`}>
                <Link to={sectionPath.projetos} className={styles.finalCard} data-cursor="view">
                  <WaboriSymbol size={44} />
                  <span className={styles.finalText}>
                    {t.allCard.map((l) => <span key={l}>{l}</span>)}
                  </span>
                  <span className={styles.finalArrow} aria-hidden="true">{ui.arrow}</span>
                </Link>
              </li>
            </ol>
          </div>
        </div>

        {/* barra de progresso: sempre no DOM, CSS esconde fora do modo preso */}
        <div className={`container-wide ${styles.bar}`} aria-hidden="true">
          <span className={styles.barFill} />
          {projects.map((_, i) => (
            <span
              key={i}
              className={styles.marker}
              style={{ '--at': `var(--stop-${i}, ${(i / Math.max(total - 1, 1)).toFixed(4)})` } as CSSProperties}
              data-done={i <= active || undefined}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

type ProjectItemProps = {
  project: Project
  index: number
  /** Visualmente ativo (fade 100%, véu some, translateY 0). */
  isActive: boolean
  /** Projeto já passou: marcador da linha fica em shu. */
  isDone: boolean
}

function ProjectItem({ project, index, isActive, isDone }: ProjectItemProps) {
  const photo = project.photos[0]

  return (
    <li
      className={styles.step}
      data-active={isActive || undefined}
      data-done={isDone || undefined}
    >
      {/* marcador do símbolo na linha horizontal */}
      <span className={styles.lineMarker} aria-hidden="true">
        <WaboriSymbol size={18} />
      </span>

      {/* número gigante + rótulo de leitura */}
      <div className={styles.numRow} aria-hidden="true">
        <div className={styles.numberWrap}>
          <span className={styles.number}>{pad2(index + 1)}</span>
          <span className={styles.numberSolid}>{pad2(index + 1)}</span>
        </div>
        <span className={`lbl ${styles.reading}`}>
          {project.areaLabel}{photo?.framing ? ` · ${ui.framing[photo.framing]}` : ''}
        </span>
      </div>

      {/* corpo: foto + texto — translada junto como um bloco */}
      <Link to={project.href} className={styles.body} data-cursor="view">
        <div className={styles.photoWrap}>
          {photo?.image ? (
            <Picture image={photo.image} alt={photo.alt} sizes={PHOTO_SIZES.gallery} className={styles.photo} />
          ) : (
            <div className={styles.placeholder} role="img" aria-label={photo?.alt ?? project.title}>
              <span aria-hidden="true">{photo?.placeholder ?? ui.placeholderPhoto}</span>
            </div>
          )}
          {photo?.state && <Tag className={styles.state}>{ui.photoState[photo.state]}</Tag>}
          <WaboriSymbol className={styles.seal} size={28} title={ui.sealLabel} />
        </div>

        <div className={styles.textCol}>
          <h3 className={styles.stepTitle}>{project.title}</h3>
          <p className={styles.description}>{project.summary}</p>
          <ul className={styles.facts}>
            {project.example && <li className={styles.exampleBadge}>{ui.exampleBadge}</li>}
            <li>{ui.sessions(project.sessions)}</li>
            <li>{ui.projectStatus[project.status]}</li>
            {project.meaning.slice(0, 3).map((m) => (
              <li key={m.element}>{m.element}</li>
            ))}
          </ul>
        </div>
      </Link>
    </li>
  )
}
