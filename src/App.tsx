import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import { Home } from './pages/Home'

// Só em desenvolvimento: o import some do build de produção
const DevComponents = import.meta.env.DEV ? lazy(() => import('./pages/DevComponents')) : null

/** Nova rota começa do topo (sem rolagem com inércia; o navegador cuida do resto). */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
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
      </Routes>
    </>
  )
}
