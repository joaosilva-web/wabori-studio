import { content, pad2 } from '../content'
import { SmartLink } from './SmartLink'
import { Tag } from './Tag'
import styles from './ProjectRow.module.css'

export type ProjectRowData = {
  slug: string
  href: string
  area: string
  title: string
  summary: string
  sessions: number
  status: 'concluido' | 'andamento'
  example?: boolean
}

type Props = {
  project: ProjectRowData
  index: number
  headingLevel?: 'h2' | 'h3'
  onActivate?: () => void
}

const ui = content.ui

/**
 * Linha da lista editorial: número, área, título + uma linha, sessões, estado e seta.
 * No hover/foco a linha se enche de shu da base (scaleY, 450 ms) e o texto vira washi.
 */
export function ProjectRow({ project, index, headingLevel: H = 'h3', onActivate }: Props) {
  return (
    <SmartLink
      href={project.href}
      className={styles.row}
      onPointerEnter={onActivate}
      onFocus={onActivate}
    >
      <span className={styles.number} aria-hidden="true">
        {pad2(index + 1)}
      </span>
      <span className={`lbl ${styles.area}`}>{project.area}</span>
      <div className={styles.main}>
        <H className={styles.title}>{project.title}</H>
        <p className={styles.summary}>{project.summary}</p>
      </div>
      <span className={styles.tags}>
        {project.example && <Tag>{ui.exampleBadge}</Tag>}
        <Tag>{ui.sessions(project.sessions)}</Tag>
        <Tag variant={project.status === 'concluido' ? 'fill' : 'outline'}>{ui.projectStatus[project.status]}</Tag>
      </span>
      <span className={styles.arrow} aria-hidden="true">
        →
      </span>
    </SmartLink>
  )
}
