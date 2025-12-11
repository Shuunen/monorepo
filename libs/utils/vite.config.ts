import { defineConfig } from "vitest/config";

export default defineConfig({
  cacheDir: "../../node_modules/.vite/libs/utils",
  plugins: [],
  root: __dirname,
  test: {
    coverage: {
      exclude: ["src/index.ts", "dist/**", "**/*.config.ts", "**/*.d.ts"],
      provider: "v8" as const,
      reporter: [["text", { maxCols: 120 }], "lcov", "html"],
      reportsDirectory: "./test-output/vitest/coverage",
    },
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts"],
    reporters: ["dot"],
    silent: true,
    watch: false,
  },
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
});
