/** Um pedaço de linha do título: texto, ou o símbolo dentro da linha. */
export type TitleSegment = { text: string } | { symbol: true }

/** Linha de título montada por segmentos. start = esquerda · indent = recuada · end = direita. */
export type TitleLine = {
  align: 'start' | 'indent' | 'end'
  segments: TitleSegment[]
}

/** Partial profundo, para traduções que ainda não cobrem tudo. */
export type DeepPartial<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly (infer U)[]
    ? readonly DeepPartial<U>[]
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T

/** Fragmento do título da capa: o texto e de onde ele chega (e para onde sai). */
export type TitleFragment = { text: string; from: 'left' | 'below' | 'above' | 'right' | 'stamp' }
