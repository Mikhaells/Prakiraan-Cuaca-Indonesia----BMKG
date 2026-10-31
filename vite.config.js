import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base relatif agar hasil build bisa diletakkan di subpath mana pun
// (mis. GitHub Pages project site: https://<user>.github.io/<repo>/)
export default defineConfig({
  plugins: [react()],
  base: './',
})
