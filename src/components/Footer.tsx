import { useRef } from 'react'
import { Link } from 'react-router'
import { content, sectionNumber, sectionPath, type SectionId } from '../content'
import { useViewProgress } from '../hooks/useViewProgress'
import { WaboriSymbol } from './Symbol'
import { TextLink } from './TextLink'
import styles from './Footer.module.css'

const { footer, nav, site } = content

const links: { section: Exclude<SectionId, 'atelie'>; label: string }[] = [
  ...nav.items,
  { section: 'iniciar', label: nav.cta },
]

/**
 * Rodapé em shu. A palavra WABORI gigante desliza na horizontal com o scroll (±15%);
 * com movimento reduzido fica parada no centro.
 */
export function Footer() {
  const ref = useRef<HTMLElement>(null)
  useViewProgress(ref, { start: 1, end: 1, reducedValue: 0.5 })

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
        <WaboriSymbol className={styles.bigSymbol} size=".8em" />
        WABORI
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
