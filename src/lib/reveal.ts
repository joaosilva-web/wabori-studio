/**
 * Um IntersectionObserver só para todas as revelações "uma vez" do site.
 * Quem entra na tela recebe data-in e sai da observação.
 * Callbacks opcionais servem a efeitos que não são CSS puro (ex.: a cortina da foto).
 */

type Callback = () => void

const callbacks = new WeakMap<Element, Callback>()
let observer: IntersectionObserver | null = null

function getObserver() {
  if (observer) return observer
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const el = entry.target
        el.setAttribute('data-in', '')
        callbacks.get(el)?.()
        callbacks.delete(el)
        observer!.unobserve(el)
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  )
  return observer
}

export function observeOnce(el: Element, onEnter?: Callback) {
  if (el.hasAttribute('data-in')) return () => {}
  if (onEnter) callbacks.set(el, onEnter)
  const io = getObserver()
  io.observe(el)
  return () => {
    io.unobserve(el)
    callbacks.delete(el)
  }
}
