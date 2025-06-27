// oxlint-disable no-console
import { preact } from '@preact/preset-vite'
import { uniqueMark } from '@shuunen/vite-plugins'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import svgReact from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [preact(), tailwindcss(), svgReact(), uniqueMark()],
  server: {
    port: 8080,
  },
})
