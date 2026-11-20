import { useEffect, useRef, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { content, sectionNumber, sectionPath, type SectionId } from '../content'
import { useReducedMotion } from '../hooks/useMediaQuery'
import { CARVE_PATH, SYMBOL_VIEWBOX, useSymbolIds, WAVE_LINE, WAVE_PATH } from './Symbol'
import { TextLink } from './TextLink'
import styles from './Footer.module.css'

const { footer, nav, site } = content

const links: { section: Exclude<SectionId, 'atelie'>; label: string }[] = [
  ...nav.items,
  { section: 'iniciar', label: nav.cta },
]

const WORD = 'WABORI'

/**
 * Cena 8 — rodapé revelado. O rodapé em shu fica preso embaixo (sticky, bottom 0, abaixo
 * da superfície da página); o conteúdo sobe e o revela como uma cortina. Com o progresso
 * da revelação (--r, 0 → 1), WABORI sobe letra por letra e o símbolo washi se desenha
 * nas três etapas da abertura (contorno, preenchimento, anel).
 * Só prende se o rodapé couber na tela; com movimento reduzido, tudo no estado final.
 */
export function Footer() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const ids = useSymbolIds()

  useEffect(() => {
    const footer = ref.current
    const surface = footer?.previousElementSibling as HTMLElement | null
    if (!footer || !surface || reduced) return

    let frame = 0
    let last = ''
    let fits = false
    const update = () => {
      frame = 0
      const vh = window.innerHeight
      const h = footer.offsetHeight
      fits = h <= vh
      footer.toggleAttribute('data-reveal', fits)
      if (!fits) {
        footer.style.removeProperty('--r')
        last = ''
        return
      }
      const bottom = surface.getBoundingClientRect().bottom
      if (bottom > vh + 40 && last === '0.0000') return
      const r = Math.min(1, Math.max(0, (vh - bottom) / h)).toFixed(4)
      if (r !== last) {
        last = r
        footer.style.setProperty('--r', r)
      }
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    const ro = new ResizeObserver(schedule)
    ro.observe(footer)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      ro.disconnect()
      footer.removeAttribute('data-reveal')
      footer.style.removeProperty('--r')
    }
  }, [reduced])

  return (
    <footer ref={ref} className={styles.footer} data-tone="primary" aria-label={footer.label}>
      <div className="container-wide">
        <div className={styles.meta}>
          <span>Wabori® — {site.tagline}</span>
          <span>{site.place}</span>
        </div>

        <div className={styles.grid}>
          <nav aria-label={footer.navLabel}>
            <ul className={styles.links}>
              {links.map((l) => (
                <li key={l.section}>
                  <Link to={sectionPath[l.section]} className={styles.link}>
                    <span className={styles.num} aria-hidden="true">
                      {sectionNumber(l.section)}
                    </span>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.contact}>
            <span className="lbl">{footer.contact}</span>
            <TextLink href={site.instagramUrl}>{site.instagramHandle}</TextLink>
            <p>{footer.note}</p>
          </div>
        </div>
      </div>

      <div className={styles.big} aria-hidden="true">
        <svg viewBox={SYMBOL_VIEWBOX} className={styles.bigSymbol} focusable="false">
          <defs>
            <clipPath id={ids.clip}>
              <circle cx="60" cy="60" r="50" />
            </clipPath>
          </defs>
          <g clipPath={`url(#${ids.clip})`}>
            <path className={styles.fill} fill="currentColor" d={WAVE_PATH} />
            <path className={styles.line} d={WAVE_LINE} pathLength={1} />
            <path className={styles.carve} d={CARVE_PATH} pathLength={1} />
          </g>
          <circle className={styles.ring} cx="60" cy="60" r="53" pathLength={1} transform="rotate(-90 60 60)" />
        </svg>
        <span className={styles.word}>
          {[...WORD].map((ch, i) => (
            <span key={i} className={styles.ch} style={{ '--i': i } as CSSProperties}>
              {ch}
            </span>
          ))}
        </span>
      </div>

      <div className={`container-wide ${styles.bottom}`}>
        <span>{footer.rights(new Date().getFullYear())}</span>
        <a href="#topo" className={styles.top}>
          {footer.top} <span aria-hidden="true">↑</span>
        </a>
      </div>
    </footer>
  )
}
