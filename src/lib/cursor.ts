/**
 * Cursor customizado — carregado por import() depois da hidratação, só com mouse
 * (pointer: fine) e sem movimento reduzido. Vive fora do React (um <div> no body).
 *
 * - Ponto shu de 8 px que segue o mouse com lerp 0,25.
 * - Sobre [data-cursor="view"] (cartões de projeto): anel do símbolo de 88 px, "Ver" em washi sobre shu.
 * - Sobre [data-cursor="drag"] (trilho de sessões): o mesmo anel com "Arrastar".
 * - Sobre links e botões: 32 px.
 * - Em campos de texto ele some e o cursor do sistema volta (texto, seleção).
 * - Toque, saída da janela ou movimento reduzido: some.
 * O tamanho muda por transform: scale (sem layout); o loop para quando o ponto assenta.
 */
import { content } from '../content'

const QUERY = '(pointer: fine) and (prefers-reduced-motion: no-preference)'
const SIZE = 88
const SCALE = { dot: 8 / SIZE, link: 32 / SIZE, view: 1, drag: 1 } as const
type State = keyof typeof SCALE

const INTERACTIVE = 'a, button, [role="button"], summary, label, select, [tabindex]:not([tabindex="-1"])'
const TEXT_FIELD = 'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]), textarea, [contenteditable="true"]'

let teardown: (() => void) | null = null

export function startCursor() {
  const mql = window.matchMedia(QUERY)
  const sync = () => {
    if (mql.matches && !teardown) teardown = mount()
    else if (!mql.matches && teardown) {
      teardown()
      teardown = null
    }
  }
  mql.addEventListener('change', sync)
  sync()
}

function mount() {
  const html = document.documentElement
  const el = document.createElement('div')
  el.className = 'wb-cursor'
  el.setAttribute('aria-hidden', 'true')
  el.innerHTML = '<span class="wb-cursor__label"></span>'
  const label = el.firstElementChild as HTMLSpanElement
  document.body.appendChild(el)

  let x = -100
  let y = -100
  let cx = x
  let cy = y
  let scale: number = SCALE.dot
  let cs = scale
  let state: State = 'dot'
  let raf = 0
  let shown = false

  const render = () => {
    raf = 0
    cx += (x - cx) * 0.25
    cy += (y - cy) * 0.25
    cs += (scale - cs) * 0.22
    const near = Math.abs(x - cx) < 0.1 && Math.abs(y - cy) < 0.1 && Math.abs(scale - cs) < 0.002
    if (near) {
      cx = x
      cy = y
      cs = scale
    }
    el.style.transform = `translate3d(${cx - SIZE / 2}px, ${cy - SIZE / 2}px, 0) scale(${cs})`
    if (!near) raf = requestAnimationFrame(render)
  }
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(render)
  }

  const setState = (next: State) => {
    if (next === state) return
    state = next
    scale = SCALE[next]
    el.dataset.state = next
    label.textContent = next === 'view' ? content.ui.cursor.view : next === 'drag' ? content.ui.cursor.drag : ''
    schedule()
  }

  const show = (v: boolean) => {
    if (v === shown) return
    shown = v
    el.classList.toggle('is-shown', v)
  }

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') {
      show(false)
      return
    }
    x = e.clientX
    y = e.clientY
    if (!shown) {
      cx = x
      cy = y
    }
    const target = e.target as Element | null
    if (target?.closest?.(TEXT_FIELD)) {
      show(false)
      return
    }
    show(true)
    const tagged = target?.closest?.('[data-cursor]') as HTMLElement | null
    const kind = tagged?.dataset.cursor
    setState(kind === 'view' || kind === 'drag' ? kind : target?.closest?.(INTERACTIVE) ? 'link' : 'dot')
    schedule()
  }
  const onLeave = () => show(false)
  const onDown = () => el.classList.add('is-down')
  const onUp = () => el.classList.remove('is-down')

  html.classList.add('has-cursor')
  el.dataset.state = state
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerdown', onDown, { passive: true })
  window.addEventListener('pointerup', onUp, { passive: true })
  document.addEventListener('pointerleave', onLeave)
  window.addEventListener('blur', onLeave)

  return () => {
    cancelAnimationFrame(raf)
    html.classList.remove('has-cursor')
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerdown', onDown)
    window.removeEventListener('pointerup', onUp)
    document.removeEventListener('pointerleave', onLeave)
    window.removeEventListener('blur', onLeave)
    el.remove()
  }
}
