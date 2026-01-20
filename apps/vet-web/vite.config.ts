// import { uniqueMark } from "@monorepo/vite-plugins";
import tailwindcss from "@tailwindcss/vite";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    emptyOutDir: true,
    outDir: "./dist",
    reportCompressedSize: true,
  },
  cacheDir: "../../node_modules/.vite/apps/vet-web",
  root: __dirname,
  plugins: [
    tsconfigPaths(),
    reactRouter(),
    tailwindcss(),
    // uniqueMark(),
  ],
  preview: {
    host: "localhost",
    port: 4300,
  },
  server: {
    allowedHosts: process.env.ALLOWED_HOSTS?.split(","),
    host: "localhost",
    port: 4200,
  },
  test: {
    coverage: {
      provider: "v8" as const,
      reportsDirectory: "./test-output/vitest/coverage",
    },
    environment: "happy-dom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    reporters: ["default"],
    watch: false,
  },
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
});
