import { Logger } from '@monorepo/utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { within } from '@storybook/testing-library'
import { userEvent } from 'storybook/test'
import { z } from 'zod'
import { AutoForm } from './auto-form'

const meta = {
  component: AutoForm,
  parameters: {
    layout: 'centered',
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

export const Default: Story = {
  args: {
    logger,
    onSubmit: data => {
      logger.showInfo('Form submitted', data)
    },
    schemas: [singleSchema],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const emailInput = canvas.getByTestId('email')
    await userEvent.type(emailInput, 'example-email@email.com')
  },
}
