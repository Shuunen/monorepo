import { createRequire } from "node:module";
import path from "node:path";
import type { StorybookConfig } from "@storybook/react-vite";

const require = createRequire(import.meta.url);

function getAbsolutePath(value: string) {
  return path.dirname(require.resolve(path.join(value, "package.json")));
}

const config: StorybookConfig = {
  addons: [getAbsolutePath("@storybook/addon-vitest"), getAbsolutePath("@storybook/addon-coverage")],
  core: {
    disableTelemetry: true,
    disableWhatsNewNotifications: true,
  },
  features: {
    sidebarOnboardingChecklist: false,
  },
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {
      builder: {
        viteConfigPath: "vite.config.ts",
      },
    },
  },
  stories: ["../src/**/*.@(mdx|stories.tsx)", "../../../apps/*/src/**/*.stories.@(js|jsx|ts|tsx|mdx)"],
  viteFinal: viteConfig => {
    viteConfig.oxc = {
      ...viteConfig.oxc,
      jsx: {
        runtime: "automatic",
      },
    };
    return viteConfig;
  },
};

// oxlint-disable-next-line no-default-export
export default config;

// To customize your Vite configuration you can use the viteFinal field.
// Check https://storybook.js.org/docs/react/builders/vite#configuration
// and https://nx.dev/recipes/storybook/custom-builder-configs
