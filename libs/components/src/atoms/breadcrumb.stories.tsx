import type { Meta, StoryObj } from '@storybook/react-vite'
import { Breadcrumb } from './breadcrumb'

const meta = {
  component: Breadcrumb,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'atoms/Breadcrumb',
} satisfies Meta<typeof Breadcrumb>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    items: [
      { label: 'Home', link: '/' },
      { label: 'Components', link: '/components' },
      { label: 'Breadcrumb', link: '/components/breadcrumb' },
    ],
  },
}
