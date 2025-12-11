import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'
import { Label } from './label'
import { Switch } from './switch'

/**
 * A control that allows the user to toggle between checked and not checked.
 */
const meta = {
  argTypes: {},
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  render: args => (
    <div className="flex items-center space-x-2">
      <Switch {...args} />
      <Label htmlFor={args.id}>Airplane Mode</Label>
    </div>
  ),
  tags: ['autodocs'],
  title: 'Commons/Atoms/Switch',
} satisfies Meta<typeof Switch>

export default meta

type Story = StoryObj<typeof meta>

/**
 * The default form of the switch.
 */
export const Default: Story = {
  args: {
    id: 'default-switch',
    name: 'airplaneMode',
  },
  play: async ({ canvas, step }) => {
    const switchBtn = await canvas.findByRole('switch')

    await step('toggle the switch on', async () => {
      await userEvent.click(switchBtn)
      await expect(switchBtn).toBeChecked()
    })

    await step('toggle the switch off', async () => {
      await userEvent.click(switchBtn)
      await expect(switchBtn).not.toBeChecked()
    })
  },
}

/**
 * Use the `disabled` prop to disable the switch.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    id: 'disabled-switch',
    name: 'airplaneMode',
  },
  play: async ({ canvas }) => {
    const switchBtn = await canvas.findByRole('switch')

    await userEvent.click(switchBtn)
    await expect(switchBtn).not.toBeChecked()
  },
}

export const ShouldToggle: Story = {
  args: {
    id: 'toggle-switch',
    name: 'airplaneMode',
  },
  name: 'when clicking the switch, should toggle it on and off',
  play: async ({ canvas, step }) => {
    const switchBtn = await canvas.findByRole('switch')

    await step('toggle the switch on', async () => {
      await userEvent.click(switchBtn)
      await expect(switchBtn).toBeChecked()
    })

    await step('toggle the switch off', async () => {
      await userEvent.click(switchBtn)
      await expect(switchBtn).not.toBeChecked()
    })
  },
  tags: ['!dev', '!autodocs'],
}
