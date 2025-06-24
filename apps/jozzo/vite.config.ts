// oxlint-disable no-console
import { preact } from '@preact/preset-vite'
import { myVitePlug } from '@shuunen/vite-plugins'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import svgReact from 'vite-plugin-svgr'

// biome-ignore lint/suspicious/noConsole: its ok
console.log('here', myVitePlug())

export default defineConfig({
  plugins: [preact(), tailwindcss(), svgReact()],
  server: {
    port: 8080,
  },
})
