import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input } from './input'

const meta = {
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'atoms/Input',
} satisfies Meta<typeof Input>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: 'default',
    placeholder: 'Enter text here',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    name: 'disabled',
    placeholder: 'Disabled input',
  },
}

export const Readonly: Story = {
  args: {
    name: 'readonly',
    placeholder: 'Readonly input',
    readOnly: true,
  },
}
