import type { Meta, StoryObj } from '@storybook/react-vite'
import { AutoFormSummaryStep } from './auto-form-summary-step'

const meta: Meta<typeof AutoFormSummaryStep> = {
  component: AutoFormSummaryStep,
  parameters: {
    layout: 'centered',
  },
  title: 'Molecules/AutoFormSummaryStep',
}

export default meta

type Story = StoryObj<typeof meta>

export const Simple: Story = {
  args: {
    data: {
      address: '123 Main St',
      age: 30,
      email: 'john@example.com',
      name: 'John Doe',
    },
    message: 'Coming soon : a summary of your form submission.',
  },
}

export const Empty: Story = {
  args: {
    data: undefined,
    message: 'Coming soon : a summary of your form submission.',
  },
}
