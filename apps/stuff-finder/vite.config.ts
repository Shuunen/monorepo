import { preact } from '@preact/preset-vite'
import { uniqueMark } from '@shuunen/vite-plugins'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [preact(), tailwindcss(), uniqueMark()],
  server: {
    port: 8080,
  },
})
