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
    placeholder: 'Enter text here',
    testId: 'input-default',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled input',
    testId: 'input-disabled',
  },
}

export const Readonly: Story = {
  args: {
    placeholder: 'Readonly input',
    readOnly: true,
    testId: 'input-readonly',
  },
}
