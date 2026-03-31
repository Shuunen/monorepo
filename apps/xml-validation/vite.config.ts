import { uniqueMark } from "@monorepo/vite-plugins";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    emptyOutDir: true,
    outDir: "./dist",
    reportCompressedSize: true,
    rolldownOptions: {
      external: ["libxml2-wasm"],
      output: {
        codeSplitting: {
          groups: [
            {
              name: "react-dom",
              test: /react-dom/,
            },
          ],
        },
      },
    },
  },
  cacheDir: "../../node_modules/.vite/apps/xml-validation",
  plugins: [react(), tailwindcss(), uniqueMark()],
  preview: {
    host: "localhost",
    port: 4300,
  },
  server: {
    host: "localhost",
    port: 4200,
  },

  worker: {
    format: "es",
  },
});
