import type { ReactNode } from 'react'
import { SmartLink } from './SmartLink'
import styles from './TextLink.module.css'

type Props = {
  href: string
  children: ReactNode
  /** → para links internos, ↗ para externos. */
  arrow?: '→' | '↗' | false
  className?: string
}

/**
 * Link de texto: sublinhado de 1,5 px (shu nas seções claras, a cor do texto nas escuras).
 * No hover/foco, o traço se apaga e é redesenhado da esquerda para a direita (900 ms, --ease-ink).
 */
export function TextLink({ href, children, arrow, className }: Props) {
  const mark = arrow ?? (/^https?:/.test(href) ? '↗' : false)
  return (
    <SmartLink href={href} className={`${styles.link} ${className ?? ''}`}>
      <span>{children}</span>
      {mark && <span aria-hidden="true">{mark}</span>}
    </SmartLink>
  )
}
