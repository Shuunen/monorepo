import type { Preview } from '@storybook/react-vite'
// Import Tailwind CSS styles for Storybook
// oxlint-disable-next-line no-unassigned-import
import '../src/styles.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

// oxlint-disable-next-line no-default-export
export { preview as default }
