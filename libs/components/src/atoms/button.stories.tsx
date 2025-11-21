import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Button } from './button'

const meta = {
  args: { onClick: fn() },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'ghost', 'link'],
    },
  },
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'atoms/Button',
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    children: 'Primary',
    name: 'primary',
  },
}

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    name: 'secondary',
    variant: 'secondary',
  },
}

export const AsChild: Story = {
  args: {
    asChild: true,
    children: <span>the child</span>,
    name: 'as-child',
  },
}
