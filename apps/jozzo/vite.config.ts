import { preact } from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import svgReact from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [preact(), tailwindcss(), svgReact()],
  server: {
    port: 8080,
  },
})
