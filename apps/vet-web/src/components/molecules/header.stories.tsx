import type { Meta, StoryObj } from '@storybook/react-vite'
import { Header } from './header.tsx'

const meta = {
  component: Header,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'molecules/Header',
} satisfies Meta<typeof Header>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
