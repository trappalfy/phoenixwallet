import { createRoot } from 'react-dom/client'
import InstallPage from './components/install/InstallPage'
import './index.css'

// Second Vite entry (install.html). Static page — no shader, no Lenis, no GSAP,
// so nothing here needs main.tsx's StrictMode caveat.
createRoot(document.getElementById('root')!).render(<InstallPage />)
