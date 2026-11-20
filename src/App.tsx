import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import { Layout } from './components/Layout'
import { About } from './pages/About'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { Projects } from './pages/Projects'
import { Process } from './pages/Process'
import { ProjectStudy } from './pages/ProjectStudy'
import { StartProject } from './pages/StartProject'
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

export function App() {
  return (
    <>
      <ScrollToTop />
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
