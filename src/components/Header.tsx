import { useEffect, useRef, type CSSProperties } from 'react'
import { Link, NavLink } from 'react-router'
import { content, sectionNumber, sectionPath } from '../content'
import { Button } from './Button'
import { MobileMenu, type MobileMenuHandle } from './MobileMenu'
import { subscribeScroll } from '../lib/scrollVelocity'
import { CARVE_PATH, SYMBOL_VIEWBOX, useSymbolIds, WAVE_PATH } from './Symbol'
import styles from './Header.module.css'

const nav = content.nav

const WORD = 'WABORI STUDIO'
/** Distância (px) descendo antes de esconder. */
const HIDE_AFTER = 8

/**
 * Header fixo: washi translúcido (sem blur — nada de vidro) com fio inferior sumi.
 * Símbolo em shu + WABORI, links numerados e "Iniciar um projeto".
 * Abaixo de 900 px, os links vão para o menu em tela cheia.
 *
 * Entra na mesma coreografia do título da capa (150 ms antes dele): o fio se desenha, o
 * símbolo é traçado, WABORI desce letra por letra, os links chegam da direita (o número
 * depois) e o botão é revelado pela tinta. Só transform, opacity e clip-path: clicável e
 * focável desde o primeiro instante. Depois da capa, some ao descer e volta ao subir
 * (lido do loop do scrollVelocity); nunca some com foco dentro dele ou com o menu aberto.
 */
export function Header() {
  const menuRef = useRef<MobileMenuHandle>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const ids = useSymbolIds()

  useEffect(() => {
    const header = headerRef.current
    if (!header) return
    const html = document.documentElement
    let anchor = window.scrollY
    let hidden = false
    const set = (h: boolean) => {
      if (h === hidden) return
      hidden = h
      header.toggleAttribute('data-hidden', h)
    }
    return subscribeScroll((y, v) => {
      if ('overHero' in html.dataset || y < 80) {
        anchor = y
        set(false)
        return
      }
      if (v < -0.5) {
        anchor = y
        set(false)
      } else if (v > 0.5) {
        if (hidden) anchor = y
        else if (y - anchor > HIDE_AFTER) set(true)
      }
    })
  }, [])

  return (
    <header ref={headerRef} className={styles.header} data-tone="light">
      <div className={`container-wide ${styles.bar}`}>
        <Link to="/" className={styles.brand} aria-label={nav.home}>
          <svg viewBox={SYMBOL_VIEWBOX} className={styles.symbol} aria-hidden="true" focusable="false">
            <defs>
              <clipPath id={ids.clip}>
                <circle cx="60" cy="60" r="50" />
              </clipPath>
              <mask id={ids.mask} maskUnits="userSpaceOnUse" x="-10" y="-10" width="140" height="140">
                <rect x="-10" y="-10" width="140" height="140" fill="#fff" />
                <path d={CARVE_PATH} fill="none" stroke="#000" strokeWidth="4" strokeLinecap="round" />
              </mask>
            </defs>
            <g clipPath={`url(#${ids.clip})`}>
              <path className={styles.wave} fill="currentColor" mask={`url(#${ids.mask})`} d={WAVE_PATH} />
            </g>
            <circle className={styles.ring} cx="60" cy="60" r="53" fill="none" stroke="currentColor" strokeWidth="8" pathLength={1} transform="rotate(-90 60 60)" />
          </svg>
          <span className={styles.word}>
            {[...WORD].map((ch, i) => (
              <span key={i} className={ch === ' ' ? styles.wordGap : styles.letterMask}>
                <span className={styles.letter} style={{ '--i': i } as CSSProperties}>
                  {ch === ' ' ? '\u00A0' : ch}
                </span>
              </span>
            ))}
          </span>
        </Link>

        <nav className={styles.nav} aria-label={nav.label}>
          <ul>
            {nav.items.map((item, i) => (
              <li key={item.section} className={styles.item} style={{ '--i': i } as CSSProperties}>
                <NavLink to={sectionPath[item.section]} className={styles.link}>
                  <sup aria-hidden="true">{sectionNumber(item.section)}</sup>
                  <span className={styles.linkText}>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <Button href={sectionPath.iniciar} className={styles.cta}>
            {nav.cta}
          </Button>
          <button
            ref={toggleRef}
            type="button"
            className={styles.toggle}
            aria-haspopup="dialog"
            aria-controls="menu"
            onClick={() => menuRef.current?.open()}
          >
            <span className={styles.toggleLines} aria-hidden="true" />
            <span className="sr-only">{nav.openMenu}</span>
            <span aria-hidden="true">Menu</span>
          </button>
        </div>
      </div>
      <MobileMenu ref={menuRef} returnFocusRef={toggleRef} />
    </header>
  )
}
