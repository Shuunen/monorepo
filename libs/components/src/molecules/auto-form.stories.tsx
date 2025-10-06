import { Logger } from '@monorepo/utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { within } from '@storybook/testing-library'
import { useState } from 'react'
import { expect, userEvent } from 'storybook/test'
import { z } from 'zod'
import { AutoForm } from './auto-form'
import { DebugData, stringify } from './debug-data'

const meta = {
  component: AutoForm,
  parameters: {
    layout: 'centered',
  },
  render: args => {
    const [submittedData, setSubmittedData] = useState<Record<string, unknown> | undefined>(undefined)
    return (
      <div className="grid gap-4 mt-6">
        <AutoForm {...args} onSubmit={data => setSubmittedData(data)} />
        <DebugData data={submittedData} />
      </div>
    )
  },
  tags: ['autodocs'],
  title: 'molecules/AutoForm',
} satisfies Meta<typeof AutoForm>

export default meta

type Story = StoryObj<typeof meta>

const logger = new Logger()

const singleSchema = z.object({
  email: z.email('Invalid email address').meta({
    label: 'Email Address',
    placeholder: "We'll never share your email",
  }),
  name: z.string().min(2, 'Name is required').meta({
    label: 'Full Name',
    placeholder: 'Enter your legal name',
  }),
})

/**
 * Single step form with basic fields
 */
export const Single: Story = {
  args: {
    logger,
    schemas: [singleSchema],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const emailInput = canvas.getByTestId('email')
    await userEvent.type(emailInput, 'example-email@email.com')
    const submitButton = canvas.getByRole('button', { name: 'Submit' })
    await userEvent.click(submitButton)
    const errorElement = await canvas.findByText('Invalid input: expected string, received undefined')
    if (!errorElement) throw new Error('Error message not found')
    const nameInput = canvas.getByTestId('name')
    await userEvent.type(nameInput, 'John Doe')
    await userEvent.click(submitButton)
    const debug = canvas.getByRole('document')
    await expect(debug).toContainHTML(stringify({ email: 'example-email@email.com', name: 'John Doe' }))
  },
}
