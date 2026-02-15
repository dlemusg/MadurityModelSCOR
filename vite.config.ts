import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Para GitHub Pages: usa /nombre-repo/ o cambia a '/' si es tu sitio principal
  base: process.env.NODE_ENV === 'production' ? '/MadurityModelSCOR/' : '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
