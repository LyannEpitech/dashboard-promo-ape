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
        branches: 55,
        functions: 55,
        lines: 55,
        statements: 55
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