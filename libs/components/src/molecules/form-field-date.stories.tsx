import { isBrowserEnvironment, Logger, stringify } from '@monorepo/utils'
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
  title: 'molecules/FormFieldDate',
} satisfies Meta<typeof AutoForm>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Basic date field with z.date() output (E2E: fill, submit, verify Date object)
 */
export const Basic: Story = {
  args: {
    schemas: [
      z.object({
        birthDate: z.date().meta({
          label: 'Birth Date',
          placeholder: 'Select your birth date',
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const dateInput = canvas.getByTestId('birth-date') as HTMLInputElement
    expect(dateInput).toBeInTheDocument()
    expect(dateInput).toHaveAttribute('type', 'date')
    await step('fill date input', async () => {
      await userEvent.clear(dateInput)
      await userEvent.type(dateInput, '1990-05-15')
      expect(dateInput).toHaveValue('1990-05-15')
    })
    await step('submit form', async () => {
      const submitButton = canvas.getByRole('button', { name: 'Submit' })
      await userEvent.click(submitButton)
    })
    await step('verify submitted data contains Date object', () => {
      const submittedData = canvas.getByTestId('debug-data-submitted-data')
      const expectedDate = new Date('1990-05-15')
      expect(submittedData).toContainHTML(stringify({ birthDate: expectedDate }, true))
    })
  },
}

/**
 * Date field with initial value (Date object input, E2E: verify initial display, form data tracking, and submit)
 */
export const WithInitialValue: Story = {
  args: {
    initialData: { eventDate: new Date('2025-12-25') },
    schemas: [
      z.object({
        eventDate: z.date().meta({
          label: 'Event Date',
          placeholder: 'Select event date',
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const dateInput = canvas.getByTestId('event-date') as HTMLInputElement
    const formData = canvas.getByTestId('debug-data-form-data')
    const submittedData = canvas.getByTestId('debug-data-submitted-data')
    await step('verify initial value is displayed', () => {
      expect(dateInput).toHaveValue('2025-12-25')
    })
    await step('verify form data shows initial Date object', () => {
      expect(formData).toContainHTML(stringify({ eventDate: new Date('2025-12-25') }, true))
    })
    await step('submit form with initial value', async () => {
      const submitButton = canvas.getByRole('button', { name: 'Submit' })
      await userEvent.click(submitButton)
    })
    await step('verify submitted data matches initial Date', () => {
      expect(submittedData).toContainHTML(stringify({ eventDate: new Date('2025-12-25') }, true))
    })
  },
}

/**
 * Optional date field
 */
export const Optional: Story = {
  args: {
    schemas: [
      z.object({
        reminderDate: z.date().optional().meta({
          label: 'Reminder Date',
          placeholder: 'Set a reminder date',
        }),
      }),
    ],
  },
}

/**
 * Disabled date field
 */
export const Disabled: Story = {
  args: {
    initialData: { lockDate: new Date('2025-01-01') },
    schemas: [
      z.object({
        lockDate: z.date().meta({
          label: 'Locked Date',
          placeholder: 'This date is locked',
          state: 'disabled',
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const dateInput = canvas.getByTestId('lock-date') as HTMLInputElement
    expect(dateInput).toBeDisabled()
    expect(dateInput).toHaveValue('2025-01-01')
  },
}

/**
 * Readonly date field
 */
export const Readonly: Story = {
  args: {
    initialData: { createdDate: new Date('2024-01-15') },
    schemas: [
      z.object({
        createdDate: z.date().meta({
          label: 'Created Date',
          placeholder: 'Creation date (readonly)',
          state: 'readonly',
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const dateInput = canvas.getByTestId('created-date') as HTMLInputElement
    expect(dateInput).toHaveAttribute('readonly')
    expect(dateInput).toHaveValue('2024-01-15')
  },
}

/**
 * String date field using render metadata (E2E: fill, submit, verify ISO string output)
 */
export const StringDateWithRender: Story = {
  args: {
    schemas: [
      z.object({
        stringDate: z.string().meta({
          label: 'String Date Field',
          placeholder: 'Select a date (string)',
          render: 'date',
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const dateInput = canvas.getByTestId('string-date') as HTMLInputElement
    const formData = canvas.getByTestId('debug-data-form-data')
    const submittedData = canvas.getByTestId('debug-data-submitted-data')
    expect(dateInput).toBeInTheDocument()
    expect(dateInput).toHaveAttribute('type', 'date')
    await step('fill date input', async () => {
      await userEvent.clear(dateInput)
      await userEvent.type(dateInput, '2023-03-20')
      expect(dateInput).toHaveValue('2023-03-20')
    })
    await step('verify form data shows ISO string', () => {
      expect(formData).toContainHTML(stringify({ stringDate: '2023-03-20' }, true))
    })
    await step('submit form', async () => {
      const submitButton = canvas.getByRole('button', { name: 'Submit' })
      await userEvent.click(submitButton)
    })
    await step('verify submitted data contains ISO string', () => {
      expect(submittedData).toContainHTML(stringify({ stringDate: '2023-03-20' }, true))
    })
  },
}
