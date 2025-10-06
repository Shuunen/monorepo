import type { Meta, StoryObj } from '@storybook/react-vite'
import { useId } from 'react'
import { Checkbox } from './checkbox'

const meta = {
  argTypes: {
    disabled: {
      control: 'boolean',
    },
  },
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'atoms/Checkbox',
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const DisabledChecked: Story = {
  args: {
    defaultChecked: true,
    disabled: true,
  },
}

export const WithLabel: Story = {
  render: () => {
    const id = useId()
    return (
      <div className="flex items-center space-x-2">
        <Checkbox id={id} />
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor={id}>
          Accept terms and conditions
        </label>
      </div>
    )
  },
}
