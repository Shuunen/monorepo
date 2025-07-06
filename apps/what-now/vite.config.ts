import { uniqueMark } from '@shuunen/vite-plugins'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [tailwindcss(), uniqueMark()],
  server: {
    port: 8080,
  },
})
