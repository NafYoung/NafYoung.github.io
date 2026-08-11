import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig(({ mode }) => ({
  base: mode === 'offline' ? './' : '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        inspired: resolve(__dirname, 'inspired/index.html'),
      },
    },
  },
}))
