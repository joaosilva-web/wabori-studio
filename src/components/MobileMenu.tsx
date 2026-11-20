import { forwardRef, useEffect, useImperativeHandle, useRef, type RefObject } from 'react'
import { NavLink, useLocation } from 'react-router'
import { content, sectionNumber, sectionPath, type SectionId } from '../content'
import { Button } from './Button'
import { WaboriSymbol } from './Symbol'
import { TextLink } from './TextLink'
import styles from './MobileMenu.module.css'

export type MobileMenuHandle = { open: () => void; close: () => void }

type Props = { returnFocusRef: RefObject<HTMLButtonElement | null> }

const nav = content.nav
const site = content.site

/**
 * Menu em tela cheia sumi (celular). <dialog> modal: prende o foco, Esc fecha,
 * o resto da página fica inerte. Fecha ao trocar de rota e devolve o foco ao botão.
 */
export const MobileMenu = forwardRef<MobileMenuHandle, Props>(function MobileMenu({ returnFocusRef }, ref) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { pathname } = useLocation()

  const close = () => {
    const d = dialogRef.current
    if (d?.open) d.close()
  }

  useImperativeHandle(ref, () => ({
    open: () => dialogRef.current?.showModal(),
    close,
  }))

  useEffect(close, [pathname])

  useEffect(() => {
    const d = dialogRef.current
    if (!d) return
    const onClose = () => {
      document.documentElement.style.removeProperty('overflow')
      returnFocusRef.current?.focus()
    }
    const onOpen = () => {
      document.documentElement.style.overflow = 'hidden'
    }
    // showModal não dispara evento de abertura; observamos o atributo open
    const mo = new MutationObserver(() => (d.open ? onOpen() : undefined))
    mo.observe(d, { attributes: true, attributeFilter: ['open'] })
    d.addEventListener('close', onClose)
    return () => {
      mo.disconnect()
      d.removeEventListener('close', onClose)
    }
  }, [returnFocusRef])

  const items: { section: Exclude<SectionId, 'atelie'>; label: string }[] = [
    ...nav.items,
    { section: 'iniciar', label: nav.cta },
  ]

  return (
    <dialog ref={dialogRef} id="menu" className={styles.menu} data-tone="dark" aria-label={nav.label}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <span className={styles.brand} aria-hidden="true">
            <WaboriSymbol size="1.38em" />
            WABORI
          </span>
          <button type="button" className={styles.close} onClick={close}>
            <span aria-hidden="true">×</span>
            <span className="sr-only">{nav.closeMenu}</span>
          </button>
        </div>

        <nav aria-label={nav.label}>
          <ol className={styles.list}>
            {items.map((item) => (
              <li key={item.section}>
                <NavLink to={sectionPath[item.section]} className={styles.link} onClick={close}>
                  <span className={styles.num} aria-hidden="true">
                    {sectionNumber(item.section)}
                  </span>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ol>
        </nav>

        <div className={styles.bottom}>
          <Button href={sectionPath.iniciar} inverse onClick={close}>
            {nav.cta}
          </Button>
          <TextLink href={site.instagramUrl}>{site.instagramHandle}</TextLink>
          <p className={styles.note}>
            {site.place} · {site.appointmentOnly}
          </p>
        </div>
      </div>
    </dialog>
  )
})
