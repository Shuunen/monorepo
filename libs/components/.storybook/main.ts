/** biome-ignore-all lint/correctness/noNodejsModules: it's a config file */
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import type { StorybookConfig } from '@storybook/react-vite'

const require = createRequire(import.meta.url)

function getAbsolutePath(value: string) {
  return dirname(require.resolve(join(value, 'package.json')))
}

const config: StorybookConfig = {
  addons: [getAbsolutePath('@chromatic-com/storybook'), getAbsolutePath('@storybook/addon-vitest'), getAbsolutePath('@storybook/addon-coverage')],
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
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
