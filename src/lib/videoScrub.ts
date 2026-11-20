/**
 * Loop de busca do vídeo da capa — carregado por import() depois da hidratação.
 *
 * O vídeo fica sempre pausado; o scroll escolhe o quadro. O quadro alvo vem da tabela
 * de trechos (heroFrames.ts). Um lerp leve (0,2) no quadro evita saltos com scroll rápido.
 * currentTime = (quadro + 0,5) / 24, no máximo uma vez por frame e só quando o quadro muda;
 * enquanto uma busca não termina, a próxima espera.
 *
 * O arquivo é all-intra (todo quadro é chave): a busca é instantânea nos dois sentidos.
 */
import { FPS } from './heroFrames'

export type Scrubber = {
  /** Novo quadro alvo (contínuo, 0 → 189). */
  setTarget(frame: number): void
  /** Liga/desliga o loop (fora da tela, desliga). */
  setActive(active: boolean): void
  dispose(): void
}

const SEEK_TIMEOUT = 2500

export function createScrubber(video: HTMLVideoElement, initial: number, onFail: () => void): Scrubber {
  let target = initial
  let current = initial
  let shown = -1
  let raf = 0
  let active = false
  let pendingSince = 0
  let failed = false

  const onSeeked = () => {
    pendingSince = 0
  }
  video.addEventListener('seeked', onSeeked)

  const tick = (now: number) => {
    raf = 0
    current += (target - current) * 0.2
    if (Math.abs(target - current) < 0.05) current = target
    const frame = Math.round(current)

    if (pendingSince) {
      // busca anterior ainda rodando: espera, mas não para sempre
      if (now - pendingSince > SEEK_TIMEOUT && !failed) {
        failed = true
        onFail()
        return
      }
    } else if (frame !== shown) {
      shown = frame
      pendingSince = now
      video.currentTime = (frame + 0.5) / FPS
    }

    if (active && (current !== target || frame !== shown || pendingSince)) raf = requestAnimationFrame(tick)
  }

  const schedule = () => {
    if (active && !raf && !failed) raf = requestAnimationFrame(tick)
  }

  return {
    setTarget(frame) {
      target = frame
      schedule()
    },
    setActive(next) {
      active = next
      if (active) schedule()
      else {
        cancelAnimationFrame(raf)
        raf = 0
      }
    },
    dispose() {
      cancelAnimationFrame(raf)
      video.removeEventListener('seeked', onSeeked)
    },
  }
}
