import type { Meta, StoryObj } from '@storybook/react-vite'
import { SourceCode } from './source-code'

const meta = {
  component: SourceCode,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'atoms/Source code',
} satisfies Meta<typeof SourceCode>

export default meta

type Story = StoryObj<typeof meta>

export const StringCode: Story = {
  args: {
    code: 'const example = "Hello, World!";',
  },
}

export const ObjectCode: Story = {
  args: {
    code: { key: 'value', nested: { anotherKey: 'anotherValue' } },
  },
}
