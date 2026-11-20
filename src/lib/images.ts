/**
 * Imagem responsiva gerada por scripts/images.mjs: AVIF e WebP em várias larguras,
 * com as dimensões do original para reservar o espaço (sem salto de layout).
 */
export type ResponsiveImage = {
  /** Fallback (WebP na maior largura). */
  src: string
  width: number
  height: number
  avif: string
  webp: string
}

export const PHOTO_SIZES = {
  /** Foto principal da capa: quase a largura toda. */
  hero: '(max-width: 760px) 100vw, min(100vw - 48px, 1680px)',
  /** Coluna de grade de fotos. */
  grid: '(max-width: 760px) 100vw, (max-width: 1200px) 50vw, 33vw',
  /** Meia largura. */
  half: '(max-width: 760px) 100vw, 50vw',
  /** Prévia da lista de projetos. */
  preview: '240px',
  /** Cartão da galeria horizontal da home (4:5, ~60 % da altura da tela). */
  gallery: '(max-width: 760px) 78vw, 48vh',
  /** Trilho de sessões. */
  track: '(max-width: 760px) 80vw, 420px',
} as const
