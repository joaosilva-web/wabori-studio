import { useEffect, useRef, type CSSProperties } from 'react'
import { content } from '../content'
import type { ResponsiveImage } from '../lib/images'
import { observeOnce } from '../lib/reveal'
import { Picture } from './Picture'
import { WaboriSymbol } from './Symbol'
import { Tag } from './Tag'
import styles from './ProjectPhoto.module.css'

export type PhotoState = 'fresca' | 'cicatrizada'
export type PhotoFraming = 'corpo' | 'area' | 'detalhe'

type Props = {
  image?: ResponsiveImage
  /** Texto do placeholder quando ainda não há foto (ex.: "[FOTO: costas, corpo inteiro]"). */
  placeholder?: string
  /** Texto alternativo: área, motivo e estado. */
  alt: string
  /** Etiqueta Fresca/Cicatrizada. Sem estado (ex.: esboço), sem etiqueta. */
  state?: PhotoState
  framing?: PhotoFraming
  /** Posição na série (legenda "01 / 03"). */
  index?: number
  total?: number
  sizes: string
  /** Acima da dobra: sem cortina, carregamento prioritário. */
  priority?: boolean
  /** Proporção. Padrão 4:5 (a do Instagram). */
  ratio?: '4/5' | '3/2' | '16/9'
  /** Proporção abaixo de 760 px (padrão: a mesma). */
  ratioMobile?: '4/5' | '3/2' | '16/9'
  className?: string
}

const ui = content.ui

/**
 * Foto de projeto sobre kinari, com etiqueta Fresca/Cicatrizada, selo de 28 px no canto inferior
 * direito e legenda (enquadramento + "01 / 03"). Revelada uma vez por uma cortina de papel que sobe;
 * a foto em si nunca se mexe, nunca é cortada (object-fit: contain) e nunca fica sobre shu.
 */
export function ProjectPhoto({
  image,
  placeholder,
  alt,
  state,
  framing,
  index,
  total,
  sizes,
  priority = false,
  ratio = '4/5',
  ratioMobile,
  className,
}: Props) {
  const frameRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = frameRef.current
    if (!el || priority) return
    return observeOnce(el)
  }, [priority])

  const hasCaption = framing || (index != null && total != null)

  return (
    <figure className={`${styles.figure} ${className ?? ''}`}>
      <div
        ref={frameRef}
        className={styles.frame}
        data-curtain={priority ? undefined : ''}
        style={{ '--ratio': ratio, '--ratio-m': ratioMobile ?? ratio } as CSSProperties}
      >
        {image ? (
          <Picture image={image} alt={alt} sizes={sizes} priority={priority} className={styles.img} />
        ) : (
          <div className={styles.placeholder} role="img" aria-label={alt}>
            <span aria-hidden="true">{placeholder ?? ui.placeholderPhoto}</span>
          </div>
        )}
        {state && <Tag className={styles.state}>{ui.photoState[state]}</Tag>}
        <WaboriSymbol className={styles.seal} size={28} title={ui.sealLabel} />
      </div>
      {hasCaption && (
        <figcaption className={styles.caption}>
          <span className="lbl">{framing ? ui.framing[framing] : ''}</span>
          {index != null && total != null && <span className={styles.counter}>{ui.photoCounter(index, total)}</span>}
        </figcaption>
      )}
    </figure>
  )
}
