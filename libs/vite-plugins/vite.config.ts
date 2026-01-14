import { coverageConfigDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  cacheDir: "../../node_modules/.vite/libs/vite-plugins",
  plugins: [],
  root: __dirname,
  test: {
    coverage: {
      exclude: [...coverageConfigDefaults.exclude, "src/index.js", "*.config.ts", "src/**/*.d.ts"],
      include: ["src"],
      provider: "v8" as const,
      reporter: [["text", { maxCols: 120 }], "lcov"],
      reportsDirectory: "./test-output/vitest/coverage",
    },
    environment: "node",
    globals: true,
    include: ["src/**/*.test.js"],
    reporters: ["default"],
    watch: false,
  },
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
});
