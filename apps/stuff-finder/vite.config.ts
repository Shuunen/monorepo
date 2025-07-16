import { preact } from '@preact/preset-vite'
import { uniqueMark } from '@shuunen/vite-plugins'
import tailwindcss from '@tailwindcss/vite'
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
  // @ts-expect-error typing issues
  plugins: [preact(), tailwindcss(), uniqueMark()],
  root: __dirname,
  server: {
    port: 8080,
  },
  test: {
    coverage: {
      exclude: ['src/utils/browser.utils.ts', 'src/utils/speech.utils.ts', 'src/constants.ts', 'src/types/*.ts', '**/*.tsx', '**/*.d.ts'],
      include: ['src'],
      provider: 'v8' as const,
      reporter: [['text', { maxCols: 120 }], 'lcov', 'html'],
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
