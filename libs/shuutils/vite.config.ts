import { defineConfig } from 'vite'

// biome-ignore lint/style/noDefaultExport: needed here
export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/libs/shuutils',
  plugins: [],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  test: {
    watch: false,
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    reporters: ['default'],
    coverage: {
      exclude: ['src/index.ts', 'dist/**', '**/*.config.ts', '**/*.d.ts'],
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}))
