import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { KilnLabPage } from './pages/KilnLabPage'
import './lab/kiln/kiln.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <KilnLabPage />
  </StrictMode>,
)
