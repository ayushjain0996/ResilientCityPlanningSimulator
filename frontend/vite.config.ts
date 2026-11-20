import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'

// In production Firebase Hosting forwards /api to the backend, so the UI and API
// share one origin. The dev proxy mirrors that, which means the backend needs no CORS setup.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxy = { '/api': env.BACKEND_PROXY_TARGET || 'http://localhost:8080' }
  return {
    plugins: [react()],
    server: { proxy },
    preview: { proxy },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/setupTests.ts'],
    },
  }
})
