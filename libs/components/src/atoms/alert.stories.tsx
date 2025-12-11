import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { Alert } from './alert'

/**
 * Displays an alert for user attention.
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
  title: 'Commons/Atoms/Alert',
} satisfies Meta<typeof Alert>

export default meta

type Story = StoryObj<typeof meta>

export const InfoType: Story = {
  args: {
    children: 'This is an informational alert message.',
    title: 'Information',
    type: 'info',
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)

    expect(canvas.getByText('Information')).toBeInTheDocument()
    expect(canvas.getByText('This is an informational alert message.')).toBeInTheDocument()

    const alert = canvas.getByRole('alert')
    expect(alert).toBeInTheDocument()

    expect(alert).toHaveClass('text-card-foreground')
  },
}

export const SuccessType: Story = {
  args: {
    children: 'This is a success alert message.',
    title: 'Success',
    type: 'success',
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)

    expect(canvas.getByText('Success')).toBeInTheDocument()
    expect(canvas.getByText('This is a success alert message.')).toBeInTheDocument()

    const alert = canvas.getByRole('alert')
    expect(alert).toHaveClass('text-success')
  },
}

export const WarningType: Story = {
  args: {
    children: 'This is a warning alert message.',
    title: 'Warning',
    type: 'warning',
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)

    expect(canvas.getByText('Warning')).toBeInTheDocument()
    expect(canvas.getByText('This is a warning alert message.')).toBeInTheDocument()

    const alert = canvas.getByRole('alert')
    expect(alert).toHaveClass('text-warning')
  },
}

export const ErrorType: Story = {
  args: {
    children: 'This is an error alert message.',
    title: 'Error',
    type: 'error',
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)

    expect(canvas.getByText('Error')).toBeInTheDocument()
    expect(canvas.getByText('This is an error alert message.')).toBeInTheDocument()

    const alert = canvas.getByRole('alert')
    expect(alert).toHaveClass('text-destructive')
  },
}

export const ErrorTitleOnly: Story = {
  args: {
    title: 'Failed to load data',
    type: 'error',
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)

    expect(canvas.getByText('Failed to load data')).toBeInTheDocument()

    expect(canvas.queryByText('This is an error alert message.')).not.toBeInTheDocument()

    const alert = canvas.getByRole('alert')
    expect(alert).toHaveClass('text-destructive')
  },
}

export const Closable: Story = {
  args: {
    children: 'Click the X button to close this alert.',
    closable: true,
    title: 'Error',
    type: 'error',
  },
}
