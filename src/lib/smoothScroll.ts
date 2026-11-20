/**
 * Rolagem suave (Lenis) — uma instância só para o site, e só onde faz sentido:
 * desktop com mouse (pointer: fine, > 760 px) e sem movimento reduzido.
 *
 * O pacote do Lenis entra por import() depois da hidratação (startSmoothScroll em main.tsx),
 * nunca no caminho da primeira pintura. Sem Lenis, tudo cai no scroll nativo:
 * as funções daqui funcionam com ou sem ele.
 *
 * O Lenis rola a própria janela (sem wrapper, sem overflow: hidden), então o sticky,
 * o IntersectionObserver e os listeners de 'scroll' continuam iguais.
 */
import type Lenis from 'lenis'

const QUERY = '(pointer: fine) and (min-width: 761px) and (prefers-reduced-motion: no-preference)'

let lenis: Lenis | null = null
let loading = false
let locks = 0

export const getLenis = () => lenis

/** Velocidade do scroll em px por frame (Lenis), ou null sem Lenis. */
export const lenisVelocity = () => (lenis ? lenis.velocity : null)

export function startSmoothScroll() {
  if (typeof window === 'undefined') return
  const mql = window.matchMedia(QUERY)
  const sync = () => (mql.matches ? create() : destroy())
  mql.addEventListener('change', sync)
  sync()
  document.addEventListener('click', onAnchorClick)
}

async function create() {
  if (lenis || loading) return
  loading = true
  const { default: LenisCtor } = await import('lenis')
  loading = false
  if (lenis || !window.matchMedia(QUERY).matches) return
  lenis = new LenisCtor({ lerp: 0.09, autoRaf: true, anchors: false, allowNestedScroll: true })
  if (locks) lenis.stop()
}

function destroy() {
  lenis?.destroy()
  lenis = null
}

/** Volta ao topo na hora (troca de rota). */
export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
  else window.scrollTo({ top: 0, behavior: 'instant' })
}

/** Rola até um elemento ou posição. Suave com Lenis; nativo (com scroll-behavior do CSS) sem ele. */
export function scrollToTarget(target: HTMLElement | number, { immediate = false, offset = 0 } = {}) {
  if (lenis) {
    lenis.scrollTo(target, { offset, immediate })
    return
  }
  const y = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY + offset
  window.scrollTo({ top: y, behavior: immediate ? 'instant' : 'smooth' })
}

/** Trava a rolagem (menu aberto). Contagem: cada lock pede um unlock. */
export function lockScroll(locked: boolean) {
  locks = Math.max(0, locks + (locked ? 1 : -1))
  if (!lenis) return
  if (locks) lenis.stop()
  else lenis.start()
}

/**
 * Links âncora da mesma página (#conteudo, #topo…) passam pelo Lenis e mantêm o foco:
 * o alvo recebe foco sem pular a tela, como na navegação nativa.
 */
function onAnchorClick(e: MouseEvent) {
  if (!lenis || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  const a = (e.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null
  if (!a) return
  const id = decodeURIComponent(a.hash.slice(1))
  const target = id ? document.getElementById(id) : null
  if (!target) return
  e.preventDefault()
  history.pushState(null, '', `#${id}`)
  lenis.scrollTo(target, {
    onComplete: () => {
      if (!target.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) {
        target.setAttribute('tabindex', '-1')
      }
      target.focus({ preventScroll: true })
    },
  })
}
