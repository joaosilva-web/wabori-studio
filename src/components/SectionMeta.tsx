import type { ReactNode } from 'react'
import { sectionNumber, type SectionId } from '../content'
import styles from './SectionMeta.module.css'

type Props = {
  /** Seção do mapa `sections`; vira "(01)". */
  section: SectionId
  label: string
  /** Complemento à direita (ex.: "Maringá — PR", "05 etapas"). */
  aside?: ReactNode
  className?: string
}

/**
 * Barra de metadados do topo das seções: "(01) Projetos" à esquerda, complemento à direita,
 * fio inferior de 1 px. O número fica em shu nas seções claras e na cor do texto nas escuras
 * (vem de --tone-accent).
 */
export function SectionMeta({ section, label, aside, className }: Props) {
  return (
    <div className={`${styles.meta} ${className ?? ''}`}>
      <span>
        <span className={styles.number}>({sectionNumber(section)})</span> {label}
      </span>
      {aside != null && <span className={styles.aside}>{aside}</span>}
    </div>
  )
}
