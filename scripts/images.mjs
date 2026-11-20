// Gera as imagens responsivas do site a partir dos originais em content/.
//
//   content/projects/<slug>/<foto>.jpg  →  public/images/projects/<slug>/<foto>-<largura>.avif|.webp
//   content/images/<foto>.jpg           →  public/images/site/<foto>-<largura>.avif|.webp
//
// Escreve src/lib/imageManifest.json com { "<slug>/<foto>.jpg": { src, width, height, avif, webp } }
// (chave "site/<foto>" para content/images). Só reprocessa o que mudou.
// Roda sozinho antes do dev e do build; à mão: npm run images
import { existsSync } from 'node:fs'
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises'
import { join, parse, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const OUT = join(ROOT, 'public/images')
const MANIFEST = join(ROOT, 'src/lib/imageManifest.json')
const WIDTHS = [480, 800, 1200, 1600, 2000]
// HEIC fica de fora: o sharp pré-compilado não decodifica (exporte como JPG)
const EXT = /\.(jpe?g|png|webp|avif|tiff?)$/i

/** [pasta de origem, prefixo da chave, pasta de saída] */
async function sources() {
  const list = []
  const projects = join(ROOT, 'content/projects')
  if (existsSync(projects)) {
    for (const slug of await readdir(projects)) {
      const dir = join(projects, slug)
      if ((await stat(dir)).isDirectory()) list.push([dir, slug, join(OUT, 'projects', slug), `/images/projects/${slug}`])
    }
  }
  const site = join(ROOT, 'content/images')
  if (existsSync(site)) list.push([site, 'site', join(OUT, 'site'), '/images/site'])
  return list
}

const toPosix = (p) => p.split('\\').join('/')

async function processImage(file, outDir, urlBase) {
  const { name } = parse(file)
  const meta = await sharp(file).rotate().metadata()
  // dimensões já corrigidas pela orientação EXIF
  const portrait = (meta.orientation ?? 1) >= 5
  const width = portrait ? meta.height : meta.width
  const height = portrait ? meta.width : meta.height
  const widths = [...new Set([...WIDTHS.filter((w) => w < width), Math.min(width, WIDTHS.at(-1))])]
  const srcMtime = (await stat(file)).mtimeMs

  await mkdir(outDir, { recursive: true })
  for (const w of widths) {
    for (const [fmt, opts] of [
      ['avif', { quality: 55, effort: 4 }],
      ['webp', { quality: 78 }],
    ]) {
      const out = join(outDir, `${name}-${w}.${fmt}`)
      if (existsSync(out) && (await stat(out)).mtimeMs >= srcMtime) continue
      await sharp(file).rotate().resize({ width: w, withoutEnlargement: true })[fmt](opts).toFile(out)
    }
  }

  const set = (fmt) => widths.map((w) => `${urlBase}/${name}-${w}.${fmt} ${w}w`).join(', ')
  return {
    src: `${urlBase}/${name}-${widths.at(-1)}.webp`,
    width,
    height,
    avif: set('avif'),
    webp: set('webp'),
  }
}

const manifest = {}
let count = 0
for (const [dir, prefix, outDir, urlBase] of await sources()) {
  for (const f of (await readdir(dir)).sort()) {
    if (!EXT.test(f)) continue
    manifest[`${prefix}/${f}`] = await processImage(join(dir, f), outDir, urlBase)
    count++
  }
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
console.log(`[images] ${count} imagem(ns) → ${toPosix(relative(ROOT, OUT))}, manifesto em src/lib/imageManifest.json`)
