import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  addons: ['@chromatic-com/storybook', '@storybook/addon-vitest', '@storybook/addon-coverage'],
  framework: {
    name: '@storybook/react-vite',
    options: {
      builder: {
        viteConfigPath: 'vite.config.ts',
      },
    },
  },
  // initially : '../src/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'
  stories: ['../src/**/*.@(mdx|stories.tsx)'],
  viteFinal: config => {
    config.esbuild = {
      ...config.esbuild,
      jsx: 'automatic',
    }
    return config
  },
}

// oxlint-disable-next-line no-default-export
export default config

// To customize your Vite configuration you can use the viteFinal field.
// Check https://storybook.js.org/docs/react/builders/vite#configuration
// and https://nx.dev/recipes/storybook/custom-builder-configs
