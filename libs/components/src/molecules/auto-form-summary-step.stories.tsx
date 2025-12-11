import type { Meta, StoryObj } from '@storybook/react-vite'
import { AutoFormSummaryStep } from './auto-form-summary-step'

const meta: Meta<typeof AutoFormSummaryStep> = {
  component: AutoFormSummaryStep,
  parameters: {
    layout: 'centered',
  },
  title: 'Commons/Molecules/AutoFormSummaryStep',
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
  },
}

export const Empty: Story = {
  args: {
    data: undefined,
  },
}

export const NestedData: Story = {
  args: {
    data: {
      user: {
        address: {
          city: 'Springfield',
          street: '456 Elm St',
          zip: '98765',
        },
        contact: {
          email: 'jane.smith@example.com',
          phone: '555-1234',
        },
        name: 'Jane Smith',
      },
    },
  },
}
