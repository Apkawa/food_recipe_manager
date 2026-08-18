import {fileURLToPath} from 'node:url'

import react from '@vitejs/plugin-react'
import {defineConfig} from 'vitest/config'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
  },
})
