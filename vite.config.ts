import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Relative base so the built site works under any GitHub Pages path,
// e.g. https://PriyankaDaggubati-png.github.io/prism/ or a custom domain.
export default defineConfig({
  base: './',
  build: {
    chunkSizeWarningLimit: 1200,
    outDir: 'dist',
  },
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/engine/__tests__/**/*.test.ts'],
  },
})
