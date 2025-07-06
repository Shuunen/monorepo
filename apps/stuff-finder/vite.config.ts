import { preact } from '@preact/preset-vite'
import { uniqueMark } from '@shuunen/vite-plugins'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

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
  plugins: [preact(), tailwindcss(), uniqueMark()],
  root: __dirname,
  server: {
    port: 8080,
  },
  test: {
    coverage: {
      exclude: ['src/utils/browser.utils.ts', 'src/utils/speech.utils.ts', 'src/constants.ts'],
      include: ['src/utils'],
      provider: 'v8' as const,
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './test-output/vitest/coverage',
      thresholds: {
        100: true,
      },
    },
    // environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    pool: 'threads',
    reporters: ['default'],
    watch: false,
  },
})
