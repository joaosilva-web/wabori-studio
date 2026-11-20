import { useRef, useState } from 'react'
import type { ResponsiveImage } from '../lib/images'
import { PHOTO_SIZES } from '../lib/images'
import { HOVER_DESKTOP, useMediaQuery, useReducedMotion } from '../hooks/useMediaQuery'
import { useFollowY } from '../hooks/useFollowY'
import { useReveal } from '../hooks/useReveal'
import { Picture } from './Picture'
import { ProjectRow, type ProjectRowData } from './ProjectRow'
import styles from './ProjectList.module.css'

export type ProjectListItem = ProjectRowData & {
  preview?: ResponsiveImage
  /** Texto do placeholder da prévia enquanto não há foto. */
  previewPlaceholder?: string
}

type Props = {
  items: readonly ProjectListItem[]
  headingLevel?: 'h2' | 'h3'
  className?: string
}

/**
 * Lista editorial de projetos. Em desktop com mouse (hover e > 760 px), uma prévia 4:5
 * acompanha o cursor no eixo Y (lerp 0,15), entrando com scale .85 → 1 e rotate -3° → 0.
 * A prévia é decorativa: a informação está toda na linha.
 */
export function ProjectList({ items, headingLevel, className }: Props) {
  const listRef = useRef<HTMLDivElement>(null)
  const ulRef = useRef<HTMLUListElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const desktop = useMediaQuery(HOVER_DESKTOP)
  const reduced = useReducedMotion()
  const [active, setActive] = useState(0)

  useReveal(ulRef, { children: true })
  useFollowY(previewRef, listRef, { enabled: desktop, lerp: reduced ? 1 : 0.15 })

  return (
    <div ref={listRef} className={`${styles.list} ${className ?? ''}`}>
      {desktop && (
        <div ref={previewRef} className={styles.preview} aria-hidden="true">
          {items.map((item, i) => (
            <div key={item.slug} className={styles.slide} data-active={i === active || undefined}>
              {item.preview ? (
                <Picture image={item.preview} alt="" sizes={PHOTO_SIZES.preview} className={styles.img} />
              ) : (
                <span className={styles.placeholder}>{item.previewPlaceholder ?? '[FOTO]'}</span>
              )}
            </div>
          ))}
        </div>
      )}
      <ul ref={ulRef} className={styles.rows}>
        {items.map((item, i) => (
          <li key={item.slug} data-rv="">
            <ProjectRow project={item} index={i} headingLevel={headingLevel} onActivate={() => setActive(i)} />
          </li>
        ))}
      </ul>
    </div>
  )
}
