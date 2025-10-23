import { uniqueMark } from '@monorepo/vite-plugins'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    emptyOutDir: true,
    outDir: './dist',
    reportCompressedSize: true,
  },
  cacheDir: '../../node_modules/.vite/apps/stuff-finder',
  plugins: [react(), tailwindcss(), uniqueMark()],
  preview: {
    host: 'localhost',
    port: 4300,
  },
  root: __dirname,
  server: {
    host: 'localhost',
    port: 4200,
  },
  test: {
    coverage: {
      exclude: ['src/utils/browser.utils.ts', 'src/utils/speech.utils.ts', 'src/utils/database.mock.ts', 'src/utils/state.utils.ts', 'src/constants.ts', 'src/types/*.ts', '**/*.tsx', '**/*.d.ts', '**/*.css'],
      include: ['src'],
      provider: 'v8' as const,
      reporter: [['text', { maxCols: 120 }], 'lcov', 'html'],
      reportsDirectory: './test-output/vitest/coverage',
      thresholds: {
        100: true,
      },
    },
    // environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    pool: 'threads',
    reporters: ['default'],
    watch: false,
  },
})
