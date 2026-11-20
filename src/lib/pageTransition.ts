/**
 * Transição entre páginas — carregada por import() depois da hidratação.
 *
 * Ao clicar num link interno: um painel shu sobe de baixo (450 ms, --ease-exit) com o símbolo
 * washi no centro; a rota troca por baixo dele; o painel sai pelo topo (600 ms, --ease-enter).
 * - Com View Transitions: a troca acontece dentro de document.startViewTransition; a captura
 *   antiga (que é o painel cobrindo a tela) desliza para cima e revela a página nova.
 * - Sem View Transitions: o próprio painel sai por uma animação (Web Animations).
 * Nunca com movimento reduzido, com menu (diálogo) aberto ou durante a abertura.
 * O foco no h1 e o anúncio do título ficam no App (RouteFocus), em toda troca de rota.
 */
import { flushSync } from 'react-dom'
import { CARVE_PATH, SYMBOL_VIEWBOX, WAVE_PATH } from '../components/Symbol'
import { getNavigate } from './navigation'
import { scrollToTop } from './smoothScroll'

const EASE_EXIT = 'cubic-bezier(.7, 0, .84, 0)'
const EASE_ENTER = 'cubic-bezier(.16, 1, .3, 1)'
const IN_MS = 450
const OUT_MS = 600

let panel: HTMLDivElement | null = null
let busy = false

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function startPageTransitions() {
  document.addEventListener('click', onClick, true)
}

function getPanel() {
  if (panel) return panel
  panel = document.createElement('div')
  panel.className = 'wb-panel'
  panel.setAttribute('aria-hidden', 'true')
  panel.hidden = true
  // o símbolo oficial (anel + onda + linha entalhada), em washi
  panel.innerHTML = `<svg viewBox="${SYMBOL_VIEWBOX}" width="96" height="96" focusable="false">
    <defs>
      <clipPath id="wb-panel-c"><circle cx="60" cy="60" r="50"/></clipPath>
      <mask id="wb-panel-m" maskUnits="userSpaceOnUse" x="-10" y="-10" width="140" height="140">
        <rect x="-10" y="-10" width="140" height="140" fill="#fff"/>
        <path d="${CARVE_PATH}" fill="none" stroke="#000" stroke-width="4" stroke-linecap="round"/>
      </mask>
    </defs>
    <g clip-path="url(#wb-panel-c)"><path fill="currentColor" mask="url(#wb-panel-m)" d="${WAVE_PATH}"/></g>
    <circle cx="60" cy="60" r="53" fill="none" stroke="currentColor" stroke-width="8"/>
  </svg>`
  document.body.appendChild(panel)
  return panel
}

function onClick(e: MouseEvent) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
  if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return
  const url = new URL(a.href, location.href)
  if (url.origin !== location.origin || url.pathname.startsWith('/api/')) return
  if (url.pathname === location.pathname) return // âncora ou mesma página: sem transição
  const html = document.documentElement
  const navigate = getNavigate()
  if (!navigate || busy || reducedMotion()) return
  if (html.classList.contains('intro') || document.querySelector('dialog[open]')) return

  e.preventDefault()
  run(url.pathname + url.search + url.hash, navigate)
}

async function run(href: string, navigate: (to: string) => void) {
  busy = true
  const el = getPanel()
  el.hidden = false
  const swap = () => {
    flushSync(() => navigate(href))
    scrollToTop()
  }

  try {
    await el.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], {
      duration: IN_MS,
      easing: EASE_EXIT,
      fill: 'forwards',
    }).finished

    if (typeof document.startViewTransition === 'function') {
      const html = document.documentElement
      html.classList.add('wb-vt')
      const vt = document.startViewTransition(() => {
        swap()
        el.hidden = true
      })
      await vt.finished.finally(() => html.classList.remove('wb-vt'))
    } else {
      swap()
      await el.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }], {
        duration: OUT_MS,
        easing: EASE_ENTER,
        fill: 'forwards',
      }).finished
    }
  } catch {
    // animação interrompida: garante a navegação
    if (location.pathname + location.search !== href.split('#')[0]) swap()
  } finally {
    el.getAnimations().forEach((a) => a.cancel())
    el.hidden = true
    busy = false
  }
}
