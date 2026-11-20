import { Outlet, useLocation } from 'react-router'
import { content, sectionPath } from '../content'
import { CtaBlock } from './CtaBlock'
import { Footer } from './Footer'
import { Header } from './Header'
import { Intro } from './Intro'

/** Moldura de todas as páginas: abertura, header fixo, conteúdo, convite final e rodapé revelado. */
export function Layout() {
  const { pathname } = useLocation()
  const showCta = pathname !== sectionPath.iniciar && !pathname.startsWith('/dev/')

  return (
    <>
      <div id="topo" />
      <a href="#conteudo" className="skip-link">
        {content.nav.skip}
      </a>
      <Header />
      {/* a superfície corre por cima do rodapé e, ao subir, revela o rodapé preso embaixo */}
      <div className="surface">
        <main id="conteudo" tabIndex={-1} style={{ paddingTop: 'var(--header-h)', outline: 'none' }}>
          <Outlet />
        </main>
        {showCta && <CtaBlock />}
      </div>
      <Footer />
      <Intro />
    </>
  )
}
