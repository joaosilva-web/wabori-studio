/**
 * Entrada de servidor — usada só no build (scripts/prerender.mjs) para gerar um HTML
 * estático por rota. O navegador depois hidrata esse HTML (main.tsx).
 */
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { App } from './App'
import { content } from './content'
import { getProjects } from './lib/projects'
import { defaultMeta, MetaContext, type MetaCollector, type PageMeta } from './lib/seo'

export function render(url: string): { html: string; meta: PageMeta } {
  const collector: MetaCollector = {}
  const html = renderToString(
    <StrictMode>
      <MetaContext.Provider value={collector}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </MetaContext.Provider>
    </StrictMode>,
  )
  return { html, meta: collector.meta ?? defaultMeta }
}

/** Rotas a pré-renderizar. A 404 vira dist/404.html. */
export function routes() {
  return ['/', '/projetos', '/processo', '/sobre', '/iniciar-projeto', ...getProjects().map((p) => p.href)]
}

/** Dados do ateliê para o JSON-LD — sem endereço (ateliê privado). */
export const site = content.site
