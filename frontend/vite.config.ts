import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// In production Firebase Hosting forwards /api to the backend, so the UI and API
// share one origin. The dev proxy mirrors that, which means the backend needs no CORS setup.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
  },
})
