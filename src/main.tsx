import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { App } from './App'
import { startSmoothScroll } from './lib/smoothScroll'
import './styles/global.css'

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)

// HTML pré-renderizado (build) → hidrata; em desenvolvimento → renderiza do zero
if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)

// Depois da hidratação e fora do caminho da primeira pintura: rolagem suave (desktop).
const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 200))
idle(() => {
  startSmoothScroll()
  // cursor customizado: só com mouse e sem movimento reduzido; o código nem baixa no toque
  if (window.matchMedia('(pointer: fine)').matches) import('./lib/cursor').then((m) => m.startCursor())
  // transição entre páginas (o próprio módulo ignora movimento reduzido a cada clique)
  import('./lib/pageTransition').then((m) => m.startPageTransitions())
})
