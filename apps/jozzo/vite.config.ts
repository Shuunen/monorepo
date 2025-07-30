// oxlint-disable no-console
import { preact } from '@preact/preset-vite'
import { uniqueMark } from '@shuunen/vite-plugins'
import tailwindcss from '@tailwindcss/vite'
import svgReact from 'vite-plugin-svgr'
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
  cacheDir: '../../node_modules/.vite/apps/jozzo',
  plugins: [preact(), tailwindcss(), svgReact(), uniqueMark()],
  server: {
    port: 8080,
  },
  test: {
    coverage: {
      include: ['src/utils'],
      provider: 'v8' as const,
      reporter: ['text', 'lcov', 'html'],
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
