import { createContext, useContext, useEffect } from 'react'
import { content } from '../content'

export type PageMeta = {
  title: string
  description: string
  /** Imagem do Open Graph (caminho absoluto no site). Padrão: /og-image.png */
  image?: string
  /** Página que não deve ser indexada (ex.: 404). */
  noindex?: boolean
}

/** No pré-render, cada página escreve aqui o que vai para o <head>. */
export type MetaCollector = { meta?: PageMeta }
export const MetaContext = createContext<MetaCollector | null>(null)

export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? '').replace(/\/$/, '')

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = value
}

/**
 * Título e descrição por página. No servidor (pré-render) entrega ao coletor;
 * no navegador atualiza o <head> ao trocar de rota.
 */
export function usePageMeta(meta: PageMeta) {
  const collector = useContext(MetaContext)
  if (collector) collector.meta = meta

  useEffect(() => {
    document.title = meta.title
    setMeta('name', 'description', meta.description)
    setMeta('property', 'og:title', meta.title)
    setMeta('property', 'og:description', meta.description)
    setMeta('name', 'twitter:title', meta.title)
    setMeta('name', 'twitter:description', meta.description)
    if (SITE_URL) setMeta('property', 'og:url', SITE_URL + window.location.pathname)
  }, [meta.title, meta.description])
}

export const defaultMeta: PageMeta = {
  title: content.site.defaultTitle,
  description: content.site.defaultDescription,
}
