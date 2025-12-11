import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, screen, userEvent, within } from 'storybook/test'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu'

/**
 * Mock for "Profile" item selection.
 * Radix-based DropdownMenuItem uses `onSelect`, not `onClick`.
 */
const onProfileSelectMock = fn()

/**
 * Displays a menu to the user — such as a set of actions or functions —
 * triggered by a button.
 */
const meta = {
  argTypes: {},
  component: DropdownMenu,
  parameters: {
    layout: 'centered',
  },
  render: args => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <DropdownMenuContent className="w-44">
        <DropdownMenuItem onSelect={onProfileSelectMock}>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuItem>Team</DropdownMenuItem>
        <DropdownMenuItem>Subscription</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  tags: ['autodocs'],
  title: 'Commons/Atoms/Dropdown Menu',
} satisfies Meta<typeof DropdownMenu>

export default meta

type Story = StoryObj<typeof meta>

/**
 * The default form of the dropdown menu.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Reset mock before each run
    onProfileSelectMock.mockClear()

    // Trigger button is in the canvas
    const trigger = canvas.getByRole('button', { name: /open/i })
    expect(trigger).toBeInTheDocument()

    // Menu content is rendered in a portal: use `screen`
    expect(screen.queryByText('Profile')).not.toBeInTheDocument()

    // Open the dropdown
    await userEvent.click(trigger, { delay: 100 })

    // Items should now be visible
    const menuItems = await screen.findAllByRole('menuitem')
    expect(menuItems).toHaveLength(4)

    expect(screen.getByText('Profile')).toBeVisible()
    expect(screen.getByText('Billing')).toBeVisible()
    expect(screen.getByText('Team')).toBeVisible()
    expect(screen.getByText('Subscription')).toBeVisible()

    // Click on "Profile" and ensure the mock is called
    const profileItem = screen.getByText('Profile')
    await userEvent.click(profileItem, { delay: 100 })
    expect(onProfileSelectMock).toHaveBeenCalledTimes(1)
  },
}
