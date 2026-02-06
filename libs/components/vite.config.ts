import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { coverageConfigDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    emptyOutDir: true,
    outDir: "./dist",
    reportCompressedSize: true,
  },
  cacheDir: "../../node_modules/.vite/libs/components",
  plugins: [react(), tailwindcss()],
  preview: {
    host: "localhost",
    port: 4300,
  },
  root: __dirname,
  server: {
    host: "localhost",
    port: 4200,
  },
  test: {
    coverage: {
      exclude: [...coverageConfigDefaults.exclude, "src/**/*.tsx", "src/**/*.types.ts"],
      include: ["src/molecules/**/*.ts", "src/atoms/**/*.ts"],
      provider: "v8" as const,
      reporter: [["text", { maxCols: 120 }], "lcov"],
      reportsDirectory: "./test-output/vitest/coverage",
    },
    environment: "happy-dom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    reporters: ["dot"],
    silent: true,
    watch: false,
  },
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
});
