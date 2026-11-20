/**
 * Mapa do scroll para o vídeo da capa. No vídeo original a tatuagem está completa no quadro 0
 * e só no contorno no quadro 189; no site, descer leva do contorno (189) à peça completa (0).
 *
 * Cada trecho: [p inicial, p final, quadro inicial, quadro final]. Os trechos parados
 * (quadro igual nos dois lados) são pausas de leitura.
 */
export const FPS = 24
export const LAST_FRAME = 189

const SEGMENTS: [number, number, number, number][] = [
  [0, 0.16, 189, 189], // só o contorno — título da capa
  [0.16, 0.44, 189, 130], // sombra e cor entrando — legenda 01
  [0.44, 0.62, 130, 60], // costas completas — legenda 02
  [0.62, 0.88, 60, 0], // a pessoa gira e mostra o braço — legenda 03
  [0.88, 1, 0, 0], // peça completa — chamada final
]

/** Etapa (0 = título, 1–3 = legendas, 4 = chamada final) para um progresso p. */
export function stepAt(p: number) {
  for (let i = SEGMENTS.length - 1; i > 0; i--) if (p >= SEGMENTS[i][0]) return i
  return 0
}

/** Quadro (contínuo) para um progresso p. */
export function frameAt(p: number) {
  for (const [p0, p1, f0, f1] of SEGMENTS) {
    if (p <= p1) return f0 + (f1 - f0) * (p1 > p0 ? (p - p0) / (p1 - p0) : 0)
  }
  return 0
}

/**
 * Marcas da régua (Contorno, Sombra, Cor, Costas, Braço): onde cada uma começa.
 * Sombra e Cor dividem o trecho 01; Costas é o 02; Braço é o 03 até o fim.
 */
export const MARKS = [0, 0.16, 0.3, 0.44, 0.62]

export function markAt(p: number) {
  for (let i = MARKS.length - 1; i > 0; i--) if (p >= MARKS[i]) return i
  return 0
}

/** Modo de imagens: qual dos 4 quadros (01 contorno · 02 cor · 03 costas · 04 final) mostrar. */
export function imageAt(p: number) {
  const f = frameAt(p)
  if (f > 170) return 0
  if (f > 115) return 1
  if (f > 30) return 2
  return 3
}

/**
 * Progresso (0 → 1) dentro do trecho em que p está. Alimenta a barra do cartão ativo,
 * a "respiração" dele e a paralaxe do numeral gigante.
 */
export function segmentProgress(p: number) {
  const i = stepAt(p)
  const [p0, p1] = SEGMENTS[i]
  return p1 > p0 ? Math.min(1, Math.max(0, (p - p0) / (p1 - p0))) : 0
}

/**
 * Pontos do corpo para as linhas de chamada dos cartões 01–03, em coordenadas do vídeo
 * 1280×720. Calibrados sobre os quadros 150 (meio das costas, onde a cor entra), 100 (ombro
 * esquerdo) e 20 (o braço fechado durante o giro).
 */
export const CALLOUT_POINTS: [number, number][] = [
  [640, 370],
  [460, 300],
  [610, 290],
]
export const VIDEO_SIZE = { w: 1280, h: 720 }
