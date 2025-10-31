import type { Meta, StoryObj } from '@storybook/react-vite'
import { Alert } from './alert'

/**
 * Displays a callout for user attention.
 */
const meta = {
  argTypes: {
    type: {
      control: { type: 'radio' },
      options: ['success', 'warning', 'error', 'info'],
    },
  },
  component: Alert,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'atoms/Alert',
} satisfies Meta<typeof Alert>

export default meta

type Story = StoryObj<typeof meta>

export const InfoType: Story = {
  args: {
    children: 'This is an informational alert message.',
    title: 'Information',
    type: 'info',
  },
}

export const SuccessType: Story = {
  args: {
    children: 'This is a success alert message.',
    title: 'Success',
    type: 'success',
  },
}

export const WarningType: Story = {
  args: {
    children: 'This is a warning alert message.',
    title: 'Warning',
    type: 'warning',
  },
}

export const ErrorType: Story = {
  args: {
    children: 'This is an error alert message.',
    title: 'Error',
    type: 'error',
  },
}
