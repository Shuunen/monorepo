import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      exclude: ['src/*.types.ts', '*.config.ts'],
      provider: 'v8' as const,
      reporter: [['text', { maxCols: 120 }], 'lcov', 'html'],
      reportsDirectory: './test-output/vitest/coverage',
    },
    // environment: 'jsdom',
    globals: true,
    include: ['src/*.test.ts'],
    pool: 'threads',
    reporters: ['default'],
    watch: false,
  },
})
