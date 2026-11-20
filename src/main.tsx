import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { App } from './App'
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
