import { uniqueMark } from '@monorepo/vite-plugins'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { Mode, plugin as md } from 'vite-plugin-markdown'
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
  cacheDir: '../../node_modules/.vite/apps/recipes',
  plugins: [
    react(),
    md({
      mode: [Mode.REACT, Mode.TOC],
    }),
    tailwindcss(),
    uniqueMark(),
  ],
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
      exclude: ['**/*.md'],
      provider: 'v8' as const,
      reportsDirectory: './test-output/vitest/coverage',
    },
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    reporters: ['default'],
    watch: false,
  },
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
})
