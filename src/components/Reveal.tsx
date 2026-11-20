import { createElement, useRef, type CSSProperties, type ReactNode } from 'react'
import { useReveal } from '../hooks/useReveal'

type Tag = 'div' | 'section' | 'li' | 'p' | 'figure' | 'header' | 'ul' | 'ol' | 'dl' | 'article'

type Props = {
  as?: Tag
  /** Posição entre irmãos para o atraso de 80 ms (máx. 8). */
  i?: number
  /** Revela os filhos diretos (que tenham data-rv) em sequência, em vez do próprio bloco. */
  stagger?: boolean
  className?: string
  style?: CSSProperties
  id?: string
  children?: ReactNode
}

/**
 * Bloco que entra de baixo (opacidade 0 → 1, 44 px → 0, 900 ms) uma vez, ao aparecer.
 * Sem JS ou com movimento reduzido, aparece direto.
 */
export function Reveal({ as = 'div', i, stagger = false, className, style, id, children }: Props) {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref, { children: stagger })
  return createElement(
    as,
    {
      ref,
      id,
      className,
      'data-rv': stagger ? undefined : '',
      style: i != null ? ({ ...style, '--i': Math.min(i, 8) } as CSSProperties) : style,
    },
    children,
  )
}
