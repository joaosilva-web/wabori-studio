import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'

// Só em desenvolvimento: o import some do build de produção
const DevComponents = import.meta.env.DEV ? lazy(() => import('./pages/DevComponents')) : null

/** Nova rota começa do topo (sem rolagem com inércia). */
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
        <Route element={<Layout />}>
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
        </Route>
      </Routes>
    </>
  )
}
