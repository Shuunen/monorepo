import { isBrowserEnvironment, Logger, sleep } from '@monorepo/utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { z } from 'zod'
import { AutoForm } from './auto-form'
import { DebugData } from './debug-data'

const logger = new Logger({ minimumLevel: isBrowserEnvironment() ? '3-info' : '5-warn' })

const meta = {
  component: AutoForm,
  parameters: {
    layout: 'centered',
  },
  render: args => {
    type FormData = Record<string, unknown> | undefined
    const [formData, setFormData] = useState<Partial<FormData>>({})
    function onChange(data: Partial<FormData>) {
      setFormData(data)
      logger.info('Form data changed', data)
    }
    const [submittedData, setSubmittedData] = useState<FormData>({})
    function onSubmit(data: FormData) {
      setSubmittedData(data)
      logger.showSuccess('Form submitted successfully')
    }
    return (
      <div className="grid gap-4 mt-6 w-lg">
        <DebugData data={formData} isGhost title="Form data" />
        <AutoForm {...args} logger={logger} onChange={onChange} onSubmit={onSubmit} />
        <DebugData data={submittedData} isGhost title="Submitted data" />
      </div>
    )
  },
  tags: ['autodocs'],
  title: 'Commons/Molecules/FormFieldAccept',
} satisfies Meta<typeof AutoForm>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  args: {
    schemas: [
      z.object({
        agreedToTerms: z.boolean().meta({
          label: 'I agree to the Terms and Conditions',
          placeholder: 'Please accept the terms',
          render: 'accept',
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const radioGroup = canvas.getByTestId('radio-group-agreed-to-terms')
    const formData = canvas.getByTestId('debug-data-form-data')
    const submittedData = canvas.getByTestId('debug-data-submitted-data')
    await step('verify radio group is rendered', () => {
      expect(radioGroup).toBeInTheDocument()
    })
    await step('check radio group initial state', () => {
      expect(formData).toContainHTML(`{}`)
      expect(submittedData).toContainHTML(`{}`)
    })
    await step('check first option', async () => {
      const acceptOption = canvas.getByLabelText('Accept')
      const rejectOption = canvas.getByLabelText('Reject')
      expect(acceptOption).toBeInTheDocument()
      expect(rejectOption).toBeInTheDocument()
      await userEvent.click(acceptOption)
      await sleep(1)
      expect(acceptOption).toBeChecked()
      expect(rejectOption).not.toBeChecked()
    })
    await step('verify form data', () => {
      expect(formData).toContainHTML(`"agreedToTerms": true`)
      expect(submittedData).toContainHTML(`{}`)
    })
    await step('check second option', async () => {
      const acceptOption = canvas.getByLabelText('Accept')
      const rejectOption = canvas.getByLabelText('Reject')
      await userEvent.click(rejectOption)
      await sleep(1)
      expect(acceptOption).not.toBeChecked()
      expect(rejectOption).toBeChecked()
    })
    await step('verify updated form data', () => {
      expect(formData).toContainHTML(`"agreedToTerms": false`)
      expect(submittedData).toContainHTML(`{}`)
    })
    await step('submit form', async () => {
      const submitButton = canvas.getByRole('button', { name: 'Submit' })
      await userEvent.click(submitButton)
    })
    await step('verify submitted data', () => {
      expect(submittedData).toContainHTML(`"agreedToTerms": false`)
    })
  },
}

export const Readonly: Story = {
  args: {
    initialData: {
      agreedToTerms: true,
    },
    schemas: [
      z.object({
        agreedToTerms: z.boolean().meta({
          label: 'I agree to the Terms and Conditions',
          placeholder: 'Please accept the terms',
          render: 'accept',
          state: 'readonly',
        }),
      }),
    ],
  },
}

export const Disabled: Story = {
  args: {
    initialData: {
      agreedToTerms: false,
    },
    schemas: [
      z.object({
        agreedToTerms: z.boolean().meta({
          label: 'I agree to the Terms and Conditions',
          placeholder: 'Please accept the terms',
          render: 'accept',
          state: 'disabled',
        }),
      }),
    ],
  },
}
