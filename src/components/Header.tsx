import { useRef } from 'react'
import { Link, NavLink } from 'react-router'
import { content, sectionNumber, sectionPath } from '../content'
import { Button } from './Button'
import { MobileMenu, type MobileMenuHandle } from './MobileMenu'
import { WaboriSymbol } from './Symbol'
import styles from './Header.module.css'

const nav = content.nav

/**
 * Header fixo: washi translúcido (sem blur — nada de vidro) com fio inferior sumi.
 * Símbolo em shu + WABORI, links numerados e "Iniciar um projeto".
 * Abaixo de 900 px, os links vão para o menu em tela cheia.
 */
export function Header() {
  const menuRef = useRef<MobileMenuHandle>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  return (
    <header className={styles.header} data-tone="light">
      <div className={`container-wide ${styles.bar}`}>
        <Link to="/" className={styles.brand} aria-label={nav.home}>
          <WaboriSymbol className={styles.symbol} size="1.38em" />
          <span className={styles.word}>WABORI</span>
        </Link>

        <nav className={styles.nav} aria-label={nav.label}>
          <ul>
            {nav.items.map((item) => (
              <li key={item.section}>
                <NavLink to={sectionPath[item.section]} className={styles.link}>
                  <sup aria-hidden="true">{sectionNumber(item.section)}</sup>
                  {item.label}
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
