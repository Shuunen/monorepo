import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      exclude: ['*.types.ts', '*.config.ts'],
      provider: 'v8' as const,
      reporter: [['text', { maxCols: 120 }], 'lcov', 'html'],
      reportsDirectory: './test-output/vitest/coverage',
      thresholds: {
        100: true,
      },
    },
    // environment: 'happy-dom',
    globals: true,
    include: ['./*.test.ts'],
    pool: 'threads',
    reporters: ['default'],
    watch: false,
  },
})
