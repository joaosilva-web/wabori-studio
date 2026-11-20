import { pt } from './pt'

export type Content = typeof pt
export type Locale = 'pt' | 'en'

export const defaultLocale: Locale = 'pt'

/**
 * Conteúdo do idioma ativo. Hoje só existe pt-BR.
 * Para ligar o inglês: importe `en` de './en', faça um merge profundo sobre `pt`
 * e escolha pelo prefixo da rota (/en/...). Os componentes não mudam: todos leem daqui.
 */
export const content: Content = pt

export { sections, sectionNumber, sectionPath, pad2, type SectionId } from './sections'
export type { TitleLine, TitleSegment } from './types'
