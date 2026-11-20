// Gera favicon.svg, apple-touch-icon.png, icon-192/512.png e favicon-32.png a partir do símbolo oficial.
// Sumi sobre washi. Rode uma vez (node scripts/icons.mjs) e versione o resultado em public/.
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const SUMI = '#353A47'
const WASHI = '#F2EFEA'
const WAVE =
  'M124 66 C 106 60, 94 38, 74 30 C 58 24, 40 26, 30 38 C 23 47, 27 59, 37 58 Q 38 48 46 50 L 44 61 Q 47 51 55 54 L 52 64 Q 56 55 64 58 C 66 70, 56 80, 36 84 C 22 88, 10 86, -4 90 L -4 124 L 124 124 Z'
const CARVE = 'M124 80 C 108 74, 96 56, 82 50 C 74 47, 68 48, 63 51'

/** pad = margem em unidades do viewBox (0–120) em volta do símbolo. */
const svg = (pad) => {
  const s = 120 + pad * 2
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${s} ${s}">
  <rect x="${-pad}" y="${-pad}" width="${s}" height="${s}" fill="${WASHI}"/>
  <defs>
    <clipPath id="c"><circle cx="60" cy="60" r="50"/></clipPath>
    <mask id="m" maskUnits="userSpaceOnUse" x="-10" y="-10" width="140" height="140">
      <rect x="-10" y="-10" width="140" height="140" fill="#fff"/>
      <path d="${CARVE}" fill="none" stroke="#000" stroke-width="4" stroke-linecap="round"/>
    </mask>
  </defs>
  <g clip-path="url(#c)"><path fill="${SUMI}" mask="url(#m)" d="${WAVE}"/></g>
  <circle cx="60" cy="60" r="53" fill="none" stroke="${SUMI}" stroke-width="8"/>
</svg>
`
}

const out = new URL('../public/', import.meta.url)
await writeFile(new URL('favicon.svg', out), svg(4))

const png = (pad, size, name) =>
  sharp(Buffer.from(svg(pad)), { density: 600 }).resize(size, size).png().toFile(fileURLToPath(new URL(name, out)))

await png(4, 32, 'favicon-32.png')
await png(22, 180, 'apple-touch-icon.png') // margem extra: iOS arredonda os cantos
await png(14, 192, 'icon-192.png')
await png(14, 512, 'icon-512.png')
await png(30, 512, 'icon-maskable-512.png') // área segura de 80% para ícones mascaráveis
console.log('ícones gerados em public/')
