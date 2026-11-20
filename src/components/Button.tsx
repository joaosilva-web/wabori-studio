import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { SmartLink } from './SmartLink'
import styles from './Button.module.css'

type Common = {
  variant?: 'primary' | 'secondary'
  /** Para fundos sumi: contorno washi. */
  inverse?: boolean
  /** Seta que avança no hover. Padrão: só no primário. */
  arrow?: boolean
  className?: string
  children: ReactNode
}

type AsLink = Common & { href: string; onClick?: () => void }
type AsButton = Common & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>

/**
 * Retângulo reto, caixa alta 700. No hover/foco, a tinta sobe da base
 * (scaleY 0 → 1, 450 ms, --ease-enter) e a seta avança 0,4 em.
 * primary: shu com texto washi, tinta sumi · secondary: contorno sumi, tinta shu.
 */
export function Button(props: AsLink | AsButton) {
  const { variant = 'primary', inverse = false, arrow = variant === 'primary', className, children } = props
  const cls = [styles.btn, styles[variant], inverse && styles.inverse, className].filter(Boolean).join(' ')
  const inner = (
    <>
      <span className={styles.label}>{children}</span>
      {arrow && (
        <span className={styles.arrow} aria-hidden="true">
          →
        </span>
      )}
    </>
  )

  if (props.href != null) {
    return (
      <SmartLink href={props.href} className={cls} onClick={props.onClick}>
        {inner}
      </SmartLink>
    )
  }

  const { variant: _v, inverse: _i, arrow: _a, className: _c, children: _ch, type = 'button', ...rest } = props
  return (
    <button type={type} className={cls} {...rest}>
      {inner}
    </button>
  )
}
