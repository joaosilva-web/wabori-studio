// Pré-renderiza cada rota em HTML estático (SEO e Open Graph sem depender de JavaScript).
// Roda depois do `vite build`: compila src/entry-server.tsx, renderiza as rotas, injeta
// o conteúdo e o <head> de cada página em dist/, e gera sitemap.xml, robots.txt e 404.html.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build, loadEnv } from 'vite'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DIST = join(ROOT, 'dist')
const SSR_OUT = join(ROOT, 'dist-ssr')

const env = loadEnv('production', ROOT, '')
const SITE_URL = (env.VITE_SITE_URL ?? '').replace(/\/$/, '')
if (!SITE_URL) {
  console.warn('[prerender] VITE_SITE_URL vazia: canonical, og:url e sitemap ficam com caminhos relativos. Defina o [DOMÍNIO] no .env.')
}

await build({
  root: ROOT,
  logLevel: 'warn',
  build: { ssr: 'src/entry-server.tsx', outDir: SSR_OUT, emptyOutDir: true },
})
const { render, routes, site } = await import(pathToFileURL(join(SSR_OUT, 'entry-server.js')).href)

const template = await readFile(join(DIST, 'index.html'), 'utf8')
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const abs = (path) => (SITE_URL ? SITE_URL + path : path)

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': ['TattooParlor', 'LocalBusiness'],
  name: site.name,
  alternateName: site.nameJa,
  description: `${site.defaultDescription}`,
  url: abs('/'),
  logo: abs('/icon-512.png'),
  image: abs('/og-image.png'),
  // ateliê privado: só cidade, sem endereço
  address: { '@type': 'PostalAddress', addressLocality: site.city, addressRegion: site.region, addressCountry: 'BR' },
  areaServed: 'BR',
  sameAs: [site.instagramUrl],
  additionalProperty: { '@type': 'PropertyValue', name: 'Atendimento', value: site.appointmentOnly },
}

function head(meta, path) {
  const image = abs(meta.image ?? '/og-image.png')
  return [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    meta.noindex ? '<meta name="robots" content="noindex" />' : `<link rel="canonical" href="${esc(abs(path))}" />`,
    '<meta property="og:type" content="website" />',
    '<meta property="og:locale" content="pt_BR" />',
    `<meta property="og:site_name" content="${esc(site.name)}" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${esc(abs(path))}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    ...(meta.image ? [] : ['<meta property="og:image:width" content="1200" />', '<meta property="og:image:height" content="630" />']),
    `<meta property="og:image:alt" content="${esc(site.name + ' — ' + site.tagline)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`,
  ].join('\n    ')
}

function page(url) {
  const { html, meta } = render(url)
  return template
    .replace(/<!--seo-->[\s\S]*?<!--\/seo-->/, head(meta, url))
    .replace('<!--app-->', html)
}

const list = routes()
for (const url of list) {
  // /sobre → dist/sobre.html (e não sobre/index.html): com cleanUrls a Vercel serve /sobre
  // direto desse arquivo, e o vite preview também. Com sobre/index.html, /sobre sem barra
  // caía no fallback da home e a hidratação falhava (o React descartava o HTML).
  const file = url === '/' ? join(DIST, 'index.html') : join(DIST, `${url}.html`)
  await mkdir(join(file, '..'), { recursive: true })
  await writeFile(file, page(url))
}
await writeFile(join(DIST, '404.html'), page('/404'))

const today = new Date().toISOString().slice(0, 10)
await writeFile(
  join(DIST, 'sitemap.xml'),
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...list.map((u) => `  <url><loc>${esc(abs(u))}</loc><lastmod>${today}</lastmod></url>`),
    '</urlset>',
    '',
  ].join('\n'),
)
await writeFile(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${abs('/sitemap.xml')}\n`)

await rm(SSR_OUT, { recursive: true, force: true })
console.log(`[prerender] ${list.length} rotas + 404 em dist/, sitemap.xml e robots.txt`)
