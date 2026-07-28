import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Two pages: the landing (index.html) and the install walkthrough
  // (install.html → served as /install by static hosts with clean URLs).
  // Paths are relative to the project root; no node: imports, so tsconfig
  // needs no @types/node.
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        install: 'install.html',
      },
    },
  },
})
