/**
 * Utilidades para quem precisa esperar a abertura (Intro) e o carregamento real da página
 * antes de começar trabalho pesado (vídeo da capa, cursor…). Só no navegador.
 */

/** Resolve quando a abertura terminou de sair (ou se ela nem aparece nesta visita). */
export function whenIntroDone(): Promise<void> {
  const html = document.documentElement
  const done = () => !html.classList.contains('intro') || html.dataset.intro === 'out'
  if (done()) return Promise.resolve()
  return new Promise((resolve) => {
    const mo = new MutationObserver(() => {
      if (!done()) return
      mo.disconnect()
      resolve()
    })
    mo.observe(html, { attributes: true, attributeFilter: ['class', 'data-intro'] })
  })
}

/** Resolve depois do evento load (todas as imagens prioritárias e fontes já chegaram). */
export function whenLoaded(): Promise<void> {
  if (document.readyState === 'complete') return Promise.resolve()
  return new Promise((resolve) => window.addEventListener('load', () => resolve(), { once: true }))
}

/** Próximo momento ocioso (com teto), para não disputar com a hidratação. */
export function whenIdle(timeout = 1500): Promise<void> {
  return new Promise((resolve) => {
    if ('requestIdleCallback' in window) window.requestIdleCallback(() => resolve(), { timeout })
    else setTimeout(resolve, 120)
  })
}

/** Rede fraca ou economia de dados: nada de mídia pesada. */
export function isConstrainedNetwork() {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
  return Boolean(c?.saveData || /(^|-)2g$/.test(c?.effectiveType ?? ''))
}
