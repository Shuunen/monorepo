import { defineConfig } from 'vite'

export default defineConfig(() => ({
  cacheDir: '../../node_modules/.vite/libs/utils',
  plugins: [],
  root: __dirname,
  test: {
    coverage: {
      exclude: ['src/index.ts', 'dist/**', '**/*.config.ts', '**/*.d.ts'],
      provider: 'v8' as const,
      reportsDirectory: './test-output/vitest/coverage',
    },
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
    reporters: ['default'],
    watch: false,
  },
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
}))
