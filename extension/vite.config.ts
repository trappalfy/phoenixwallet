import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Popup-only extension: one HTML entry, emitted to dist/ alongside the copied
// public/ tree (manifest.json, icons, fonts). Chrome serves dist/ as the
// extension root, so the default absolute asset base resolves correctly.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // MV3 forbids inline scripts; keep every asset an external file.
    assetsInlineLimit: 0,
  },
})
