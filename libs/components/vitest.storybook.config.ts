import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { coverageConfigDefaults, defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const reportsRoot = path.join(__dirname, "storybook-html-reports");

export default defineConfig({
  optimizeDeps: {
    include: ["react/jsx-dev-runtime"],
  },
  plugins: [
    // The plugin will run tests for the stories defined in your Storybook config
    // See options at: https://storybook.js.org/docs/writing-tests/test-addon#storybooktest
    storybookTest({ configDir: path.join(__dirname, ".storybook") }),
  ],
  test: {
    browser: {
      enabled: true,
      headless: true,
      instances: [
        {
          browser: "chromium",
        },
      ],
      provider: playwright(),
    },
    coverage: {
      enabled: true,
      exclude: [
        ...coverageConfigDefaults.exclude,
        "src/**/*.stories.{ts,tsx}",
        "src/**/*.test.{ts,tsx}",
        "node_modules/**",
        "dist/**",
      ],
      include: ["src/**/*.{ts,tsx}"],
      provider: "v8",
      reportOnFailure: true,
      reporter: ["text", "lcov", "html"],
      reportsDirectory: path.join(reportsRoot, "storybook"),
    },
    name: "storybook",
    outputFile: {
      html: path.join(reportsRoot, "index.html"),
    },
    reporters: ["dot", "html"],
    setupFiles: [".storybook/vitest.setup.ts"],
    silent: true,
  },
});
