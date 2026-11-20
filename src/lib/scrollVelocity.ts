/**
 * Velocidade pelo scroll — um loop só para o site inteiro.
 *
 * A cada frame: v = velocidade do Lenis (px/frame) quando ele está ativo; sem Lenis,
 * v = scrollY − lastY (normalizado para 60 fps).
 *   |v| > 0.5 → target = sign(v) · (1 + min(|v| · 0.35, 7))
 *   senão     → target volta devagar para ±1 (mantém o último sentido)
 *   rate += (target − rate) · 0.1
 * O rate vira o playbackRate de toda animação registrada (Kaze, faixa em shu).
 * Rolar para cima inverte o sentido.
 *
 * Além do rate, o loop calcula a intensidade (0 → 1, |v| normalizado e suavizado: sobe rápido,
 * acalma devagar). Ela vai para os callbacks registrados (amplitude do Kaze, skew da faixa).
 *
 * Só entradas visíveis recebem valores; as de fora da tela ficam pausadas.
 * O loop para quando tudo assenta e volta no próximo evento de scroll.
 * Nada passa pelo React.
 */
import { lenisVelocity } from './smoothScroll'

export type VelocityFrame = { rate: number; intensity: number }
type Entry = { animations: Animation[]; onFrame?: (f: VelocityFrame) => void; visible: boolean }

const FRAME = 1000 / 60
/** |v| (px/frame) que conta como intensidade máxima. */
const V_MAX = 48
const entries = new Set<Entry>()

let rate = 1
let target = 1
let intensity = 0
let lastY = 0
let lastT = 0
let raf = 0
let listening = false

const lerp = (k: number, f: number) => 1 - Math.pow(1 - k, f)

function apply() {
  const frame = { rate, intensity }
  for (const e of entries) {
    if (!e.visible) continue
    for (const a of e.animations) a.playbackRate = rate
    e.onFrame?.(frame)
  }
}

function tick(now: number) {
  const f = lastT ? Math.min((now - lastT) / FRAME, 4) : 1
  lastT = now
  const y = window.scrollY
  const lv = lenisVelocity()
  const v = lv ?? (y - lastY) / f
  lastY = y

  if (Math.abs(v) > 0.5) {
    target = Math.sign(v) * (1 + Math.min(Math.abs(v) * 0.35, 7))
  } else {
    const home = Math.sign(target) || 1
    target += (home - target) * lerp(0.04, f)
  }
  rate += (target - rate) * lerp(0.1, f)

  const want = Math.min(Math.abs(v) / V_MAX, 1)
  intensity += (want - intensity) * lerp(want > intensity ? 0.18 : 0.05, f)

  const home = Math.sign(target) || 1
  const settled =
    Math.abs(v) <= 0.5 && Math.abs(target - home) < 0.002 && Math.abs(rate - target) < 0.002 && intensity < 0.002
  if (settled) {
    rate = target = home
    intensity = 0
  }

  apply()
  raf = settled ? 0 : requestAnimationFrame(tick)
  if (!raf) lastT = 0
}

function wake() {
  if (raf || !hasVisible()) return
  lastY = window.scrollY
  raf = requestAnimationFrame(tick)
}

const hasVisible = () => [...entries].some((e) => e.visible)

function listen() {
  if (listening) return
  listening = true
  lastY = window.scrollY
  window.addEventListener('scroll', wake, { passive: true })
}

function unlisten() {
  if (!listening || entries.size) return
  listening = false
  window.removeEventListener('scroll', wake)
  cancelAnimationFrame(raf)
  raf = 0
  lastT = 0
}

/**
 * Registra animações em loop (e, opcionalmente, um callback por frame com rate e intensidade).
 * Devolve funções para avisar visibilidade e desregistrar.
 */
export function registerLoop(animations: Animation[], onFrame?: (f: VelocityFrame) => void) {
  const entry: Entry = { animations, onFrame, visible: false }
  entries.add(entry)
  listen()
  animations.forEach((a) => a.pause())

  return {
    setVisible(visible: boolean) {
      if (entry.visible === visible) return
      entry.visible = visible
      for (const a of animations) {
        if (visible) {
          a.playbackRate = rate
          a.play()
        } else {
          a.pause()
        }
      }
      if (visible) {
        onFrame?.({ rate, intensity })
        wake()
      }
    },
    dispose() {
      entries.delete(entry)
      animations.forEach((a) => a.cancel())
      unlisten()
    },
  }
}
