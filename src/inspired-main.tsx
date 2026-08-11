import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { InspiredLabPage } from './pages/InspiredLabPage'
import './lab/inspired/inspired.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <InspiredLabPage />
  </StrictMode>,
)
