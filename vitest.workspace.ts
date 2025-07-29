// biome-ignore lint/correctness/noNodejsModules: it's ok here
import path from 'node:path'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  '**/vite.config.{mjs,js,ts,mts}',
  '**/vitest.config.{mjs,js,ts,mts}',
  // Storybook test configuration for components library
  {
    extends: 'libs/components/vite.config.ts',
    plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/writing-tests/test-addon#storybooktest
      storybookTest({ configDir: path.join(process.cwd(), 'libs/components/.storybook') }),
    ],
    test: {
      browser: {
        enabled: true,
        headless: true,
        name: 'chromium',
        provider: 'playwright',
      },
      name: 'storybook',
      setupFiles: ['libs/components/.storybook/vitest.setup.ts'],
    },
  },
])
