import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// No StrictMode: the shader (WebGL context + rAF), Lenis and GSAP are imperative
// and StrictMode's dev double-mount spams context/loop re-inits. Prod is unaffected.
createRoot(document.getElementById('root')!).render(<App />)
