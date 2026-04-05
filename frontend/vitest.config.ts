import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    coverage: {
      reporter: ['text', 'html', 'json-summary', 'lcov'],
      exclude: ['node_modules/', 'src/test/', 'src/**/*.test.tsx', 'src/**/*.test.ts'],
      thresholds: {
        branches: 40,
        functions: 40,
        lines: 40,
        statements: 40
      }
    }
  },
  server: {
    proxy: {
      '/auth': 'http://localhost:3001',
      '/api': 'http://localhost:3001'
    }
  }
})