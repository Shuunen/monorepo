import type { Meta, StoryObj } from '@storybook/react-vite'
// oxlint-disable-next-line no-restricted-imports
import { Bold, Italic } from 'lucide-react'
import { Toggle } from './toggle'

/**
 * A two-state button that can be either on or off.
 */
const meta: Meta<typeof Toggle> = {
  args: {
    'aria-label': 'Toggle bold',
    children: <Bold className="h-4 w-4" />,
  },
  argTypes: {
    children: {
      control: { disable: true },
    },
  },
  component: Toggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'atoms/Toggle',
}
export default meta

type Story = StoryObj<typeof Toggle>

/**
 * The default form of the toggle.
 */
export const Default: Story = {}

/**
 * Use the `outline` variant for a distinct outline, emphasizing the boundary
 * of the selection circle for clearer visibility
 */
export const Outline: Story = {
  args: {
    'aria-label': 'Toggle italic',
    children: <Italic className="h-4 w-4" />,
    variant: 'outline',
  },
}

/**
 * Use the text element to add a label to the toggle.
 */
export const WithText: Story = {
  args: { ...Outline.args },
  render: args => (
    <Toggle {...args}>
      <Italic className="mr-2 h-4 w-4" />
      Italic
    </Toggle>
  ),
}

/**
 * Use the `sm` size for a smaller toggle, suitable for interfaces needing
 * compact elements without sacrificing usability.
 */
export const Small: Story = {
  args: {
    size: 'sm',
  },
}

/**
 * Use the `lg` size for a larger toggle, offering better visibility and
 * easier interaction for users.
 */
export const Large: Story = {
  args: {
    size: 'lg',
  },
}

/**
 * Add the `disabled` prop to prevent interactions with the toggle.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
}
