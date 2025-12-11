import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './badge'
import { Button } from './button'
import { Spinner } from './spinner'

/**
 * An indicator that can be used to show a loading state.
 */
const meta: Meta<typeof Spinner> = {
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Commons/Atoms/Spinner',
} satisfies Meta<typeof Spinner>

export default meta

type Story = StoryObj<typeof meta>

/**
 * Add a spinner to a button to indicate a loading state.
 */
export const Default: Story = {
  render: args => <Spinner {...args} />,
}

/**
 * Add a spinner to a button to indicate a loading state.
 */
export const WithButton: Story = {
  render: args => (
    <Button disabled size="sm" testId="storybook-button">
      <Spinner {...args} />
      Loading...
    </Button>
  ),
}

/**
 * You can also use a spinner inside a badge.
 */
export const WithBadge: Story = {
  render: args => (
    <Badge>
      <Spinner {...args} />
      Syncing
    </Badge>
  ),
}
