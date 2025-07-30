import type { Meta, StoryObj } from '@storybook/react'
import { expect } from 'storybook/test'
import { Landing } from './landing'

const meta: Meta<typeof Landing> = {
  component: Landing,
  title: 'Landing',
}
export default meta
type Story = StoryObj<typeof Landing>

export const Basic: Story = {
  args: {
    status: 'the status text',
    subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    title: 'Welcome to Landing',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Welcome to Landing')).toBeTruthy()
  },
}
