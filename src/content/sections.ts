/**
 * Numeração única das seções: menu, barras de metadados e rodapé usam este mapa.
 * Independe do idioma. O ateliê (ideia central da home) fica fora do menu, por isso é o 00.
 */
export const sections = {
  atelie: 0,
  projetos: 1,
  processo: 2,
  sobre: 3,
  iniciar: 4,
} as const

export type SectionId = keyof typeof sections

/** Número da seção com dois dígitos: 1 → "01". */
export const sectionNumber = (id: SectionId) => String(sections[id]).padStart(2, '0')

/** Rota de cada seção que tem página própria. */
export const sectionPath: Record<Exclude<SectionId, 'atelie'>, string> = {
  projetos: '/projetos',
  processo: '/processo',
  sobre: '/sobre',
  iniciar: '/iniciar-projeto',
}

export const pad2 = (n: number) => String(n).padStart(2, '0')
