"""Gera public/og-image.svg (1200x630) com o texto convertido em contornos, a partir das fontes do site.
Depois: node scripts/og-image.mjs converte para PNG. Requer: pip install fonttools brotli
Uso: python scripts/og-image.py
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / 'public' / 'fonts'
SUMI, WASHI, SHU = '#353A47', '#F2EFEA', '#C23B22'
WAVE = ('M124 66 C 106 60, 94 38, 74 30 C 58 24, 40 26, 30 38 C 23 47, 27 59, 37 58 Q 38 48 46 50 L 44 61 '
        'Q 47 51 55 54 L 52 64 Q 56 55 64 58 C 66 70, 56 80, 36 84 C 22 88, 10 86, -4 90 L -4 124 L 124 124 Z')
CARVE = 'M124 80 C 108 74, 96 56, 82 50 C 74 47, 68 48, 63 51'


def text_path(font_file, text, size, x, y, tracking=0.0):
    """Contorno SVG de `text` com a linha de base em (x, y). Devolve (d, largura)."""
    font = TTFont(FONTS / font_file)
    upm = font['head'].unitsPerEm
    cmap = font.getBestCmap()
    gs = font.getGlyphSet()
    hmtx = font['hmtx']
    s = size / upm
    pen = SVGPathPen(gs)
    cursor = 0.0
    for ch in text:
        name = cmap.get(ord(ch))
        if name is None:
            continue
        tp = TransformPen(pen, (s, 0, 0, -s, x + cursor, y))
        gs[name].draw(tp)
        cursor += hmtx[name][0] * s + tracking * size
    return pen.getCommands(), cursor - tracking * size


def main():
    w, h = 1200, 630
    pad = 80
    word, ww = text_path('zen-old-mincho-900.woff2', 'WABORI', 132, 0, 0, tracking=0.03)
    tag, tw = text_path('zen-kaku-gothic-new-700.woff2', 'TATUAGEM JAPONESA TRADICIONAL', 24, 0, 0, tracking=0.12)
    place, pw = text_path('zen-kaku-gothic-new-700.woff2', 'MARINGÁ — PR', 24, 0, 0, tracking=0.12)
    title, _ = text_path('zen-old-mincho-900.woff2', 'O corpo inteiro como composição.', 52, 0, 0)

    # assinatura: símbolo = 1,9 × caixa alta (0,726 × 132 ≈ 96 → 182)
    sym = 182
    cap = 0.726 * 132
    sx, sy = pad, 250
    wx = sx + sym + 36
    wy = sy + sym / 2 + cap / 2

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
  <rect width="{w}" height="{h}" fill="{WASHI}"/>
  <rect y="{h - 18}" width="{w}" height="18" fill="{SHU}"/>
  <path transform="translate({pad} 96)" d="{tag}" fill="{SUMI}"/>
  <path transform="translate({w - pad - pw} 96)" d="{place}" fill="{SUMI}"/>
  <rect x="{pad}" y="122" width="{w - 2 * pad}" height="1.5" fill="{SUMI}"/>
  <svg x="{sx}" y="{sy}" width="{sym}" height="{sym}" viewBox="0 0 120 120">
    <defs>
      <clipPath id="c"><circle cx="60" cy="60" r="50"/></clipPath>
      <mask id="m" maskUnits="userSpaceOnUse" x="-10" y="-10" width="140" height="140">
        <rect x="-10" y="-10" width="140" height="140" fill="#fff"/>
        <path d="{CARVE}" fill="none" stroke="#000" stroke-width="4" stroke-linecap="round"/>
      </mask>
    </defs>
    <g clip-path="url(#c)"><path fill="{SHU}" mask="url(#m)" d="{WAVE}"/></g>
    <circle cx="60" cy="60" r="53" fill="none" stroke="{SHU}" stroke-width="8"/>
  </svg>
  <path transform="translate({wx} {wy})" d="{word}" fill="{SUMI}"/>
  <path transform="translate({pad} {h - 80})" d="{title}" fill="{SUMI}"/>
</svg>
'''
    (ROOT / 'scripts' / 'og-image.svg').write_text(svg, encoding='utf-8')
    print('scripts/og-image.svg gerado')


main()
