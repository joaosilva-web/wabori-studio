import { lazy, Suspense, useEffect, useRef } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router'
import { Layout } from './components/Layout'
import { About } from './pages/About'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { Projects } from './pages/Projects'
import { Process } from './pages/Process'
import { ProjectStudy } from './pages/ProjectStudy'
import { StartProject } from './pages/StartProject'
import { setNavigate } from './lib/navigation'
import { scrollToTop } from './lib/smoothScroll'

// Só em desenvolvimento: o import some do build de produção
const DevComponents = import.meta.env.DEV ? lazy(() => import('./pages/DevComponents')) : null

/** Nova rota começa do topo, na hora (com Lenis: lenis.scrollTo(0, { immediate: true })). */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    scrollToTop()
  }, [pathname])
  return null
}

/** Entrega o navigate do roteador para código fora do React (transição de página). */
function NavigateBridge() {
  const navigate = useNavigate()
  useEffect(() => {
    setNavigate((to) => navigate(to))
    return () => setNavigate(null)
  }, [navigate])
  return null
}

/**
 * A cada troca de rota (não na primeira carga): o foco vai para o h1 da nova página
 * e o título do documento é anunciado para leitores de tela.
 */
function RouteFocus() {
  const { pathname } = useLocation()
  const first = useRef(true)
  const liveRef = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    // depois do usePageMeta da página nova ter trocado o título
    const id = setTimeout(() => {
      const h1 = document.querySelector<HTMLElement>('main h1')
      if (h1) {
        if (!h1.hasAttribute('tabindex')) h1.setAttribute('tabindex', '-1')
        h1.focus({ preventScroll: true })
      }
      if (liveRef.current) liveRef.current.textContent = document.title
    }, 60)
    return () => clearTimeout(id)
  }, [pathname])
  return <p ref={liveRef} className="sr-only" aria-live="polite" aria-atomic="true" />
}

export function App() {
  return (
    <>
      <ScrollToTop />
      <NavigateBridge />
      <RouteFocus />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/projetos" element={<Projects />} />
          <Route path="/projetos/:slug" element={<ProjectStudy />} />
          <Route path="/processo" element={<Process />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/iniciar-projeto" element={<StartProject />} />
          {DevComponents && (
            <Route
              path="/dev/componentes"
              element={
                <Suspense fallback={null}>
                  <DevComponents />
                </Suspense>
              }
            />
          )}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}
