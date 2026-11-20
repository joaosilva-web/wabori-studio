import type { ReactNode } from 'react'
import styles from './Tag.module.css'

type Props = {
  /** outline: contorno na cor do texto · fill: shu com texto washi */
  variant?: 'outline' | 'fill'
  className?: string
  children: ReactNode
}

/** Etiqueta reta, caixa alta 700. Ex.: "18 sessões", "Cicatrizada". */
export function Tag({ variant = 'outline', className, children }: Props) {
  return <span className={`${styles.tag} ${styles[variant]} ${className ?? ''}`}>{children}</span>
}
