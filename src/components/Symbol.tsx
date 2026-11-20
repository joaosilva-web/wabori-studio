import { useId, type CSSProperties, type SVGProps } from 'react'

/*
 * Símbolo oficial do Wabori (versão A): anel = mikiri · onda com garras · contorno entalhado.
 * NÃO redesenhar. Colorido por currentColor; a linha entalhada é máscara, funciona em qualquer fundo.
 * Regras: mínimo 16 px, nunca girar, nunca distorcer, nunca sobre a área principal de uma foto.
 */
export const SYMBOL_VIEWBOX = '0 0 120 120'
export const WAVE_PATH =
  'M124 66 C 106 60, 94 38, 74 30 C 58 24, 40 26, 30 38 C 23 47, 27 59, 37 58 Q 38 48 46 50 L 44 61 Q 47 51 55 54 L 52 64 Q 56 55 64 58 C 66 70, 56 80, 36 84 C 22 88, 10 86, -4 90 L -4 124 L 124 124 Z'
export const CARVE_PATH = 'M124 80 C 108 74, 96 56, 82 50 C 74 47, 68 48, 63 51'

/** Defs (clip + máscara) com ids únicos por instância. */
export function useSymbolIds() {
  const raw = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  return { clip: `wb-c-${raw}`, mask: `wb-m-${raw}` }
}

export function SymbolDefs({ clip, mask }: { clip: string; mask: string }) {
  return (
    <defs>
      <clipPath id={clip}>
        <circle cx="60" cy="60" r="50" />
      </clipPath>
      <mask id={mask} maskUnits="userSpaceOnUse" x="-10" y="-10" width="140" height="140">
        <rect x="-10" y="-10" width="140" height="140" fill="#fff" />
        <path d={CARVE_PATH} fill="none" stroke="#000" strokeWidth="4" strokeLinecap="round" />
      </mask>
    </defs>
  )
}

type Props = Omit<SVGProps<SVGSVGElement>, 'children'> & {
  /** Texto para leitores de tela. Sem ele, o símbolo é decorativo. */
  title?: string
  /** Tamanho (px ou qualquer unidade CSS). Padrão: 1em. */
  size?: number | string
}

export function WaboriSymbol({ title, size = '1em', style, ...rest }: Props) {
  const ids = useSymbolIds()
  const a11y = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true as const, focusable: false as const }
  return (
    <svg
      viewBox={SYMBOL_VIEWBOX}
      width={typeof size === 'number' ? size : undefined}
      height={typeof size === 'number' ? size : undefined}
      style={{ width: size, height: size, minWidth: 16, minHeight: 16, flex: 'none', ...style } as CSSProperties}
      {...a11y}
      {...rest}
    >
      <SymbolDefs {...ids} />
      <g clipPath={`url(#${ids.clip})`}>
        <path fill="currentColor" mask={`url(#${ids.mask})`} d={WAVE_PATH} />
      </g>
      <circle cx="60" cy="60" r="53" fill="none" stroke="currentColor" strokeWidth="8" />
    </svg>
  )
}
