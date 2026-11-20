import type { CSSProperties } from 'react'
import type { ResponsiveImage } from '../lib/images'

type Props = {
  image: ResponsiveImage
  alt: string
  sizes: string
  /** Acima da primeira dobra: carrega já, com prioridade (LCP). */
  priority?: boolean
  className?: string
  style?: CSSProperties
}

/** <picture> com AVIF e WebP, dimensões explícitas e lazy abaixo da dobra. */
export function Picture({ image, alt, sizes, priority = false, className, style }: Props) {
  return (
    <picture>
      <source type="image/avif" srcSet={image.avif} sizes={sizes} />
      <source type="image/webp" srcSet={image.webp} sizes={sizes} />
      <img
        src={image.src}
        alt={alt}
        width={image.width}
        height={image.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : undefined}
        className={className}
        style={style}
      />
    </picture>
  )
}
