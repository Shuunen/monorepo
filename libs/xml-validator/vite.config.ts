import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import { coverageConfigDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  build: {
    rolldownOptions: {
      external: ["libxml2-wasm"],
    },
  },
  cacheDir: "../../node_modules/.vite/libs/xml-validator",
  plugins: [],
  test: {
    coverage: {
      exclude: [
        ...coverageConfigDefaults.exclude,
        "src/index.ts",
        "dist/**",
        "**/*.config.ts",
        "**/*.d.ts",
        "src/xml-validator.worker.ts",
      ],
      include: ["src/**/*.{ts,tsx}"],
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
  worker: {
    plugins: () => [nxViteTsPaths()],
  },
});
