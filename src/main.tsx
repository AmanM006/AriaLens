import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { A11yEngine } from './lib/a11y/engine'

// Expose to window for manual DevTools testing
if (typeof window !== 'undefined') {
  (window as any).A11yEngine = A11yEngine;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
