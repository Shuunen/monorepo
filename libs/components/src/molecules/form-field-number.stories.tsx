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
  title: 'molecules/FormFieldNumber',
} satisfies Meta<typeof AutoForm>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Basic number field (E2E: fill with number, submit, verify numeric output)
 */
export const Basic: Story = {
  args: {
    schemas: [
      z.object({
        age: z.number().meta({
          label: 'Age',
          placeholder: 'Enter your age',
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const numberInput = canvas.getByTestId('input-number-age') as HTMLInputElement
    const submittedData = canvas.getByTestId('debug-data-submitted-data')

    expect(numberInput).toBeInTheDocument()
    expect(numberInput).toHaveAttribute('type', 'number')

    await step('fill number input', async () => {
      await userEvent.clear(numberInput)
      await userEvent.type(numberInput, '25')
      expect(numberInput).toHaveValue(25)
    })

    await step('submit form', async () => {
      const submitButton = canvas.getByRole('button', { name: 'Submit' })
      await userEvent.click(submitButton)
    })

    await step('verify submitted data contains number', () => {
      expect(submittedData).toContainHTML(stringify({ age: 25 }, true))
    })
  },
}

/**
 * Number field with initial value (E2E: verify initial display and submit)
 */
export const WithInitialValue: Story = {
  args: {
    initialData: { quantity: 10 },
    schemas: [
      z.object({
        quantity: z.number().meta({
          label: 'Quantity',
          placeholder: 'Enter quantity',
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const numberInput = canvas.getByTestId('input-number-quantity') as HTMLInputElement
    const formData = canvas.getByTestId('debug-data-form-data')
    const submittedData = canvas.getByTestId('debug-data-submitted-data')
    await step('verify initial value is displayed', () => {
      expect(numberInput).toHaveValue(10)
    })
    await step('verify form data shows initial number', () => {
      expect(formData).toContainHTML(stringify({ quantity: 10 }, true))
    })
    await step('submit form with initial value', async () => {
      const submitButton = canvas.getByRole('button', { name: 'Submit' })
      await userEvent.click(submitButton)
    })
    await step('verify submitted data matches initial value', () => {
      expect(submittedData).toContainHTML(stringify({ quantity: 10 }, true))
    })
  },
}

/**
 * Optional number field
 */
export const Optional: Story = {
  args: {
    schemas: [
      z.object({
        score: z.number().optional().meta({
          label: 'Score',
          placeholder: 'Enter optional score',
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const submitButton = canvas.getByRole('button', { name: 'Submit' })
    expect(submitButton).not.toBeDisabled()
  },
}

/**
 * Disabled number field
 */
export const Disabled: Story = {
  args: {
    initialData: { studentId: 12345 },
    schemas: [
      z.object({
        studentId: z.number().meta({
          label: 'Student ID',
          placeholder: 'Your student ID',
          state: 'disabled',
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const studentIdInput = canvas.getByTestId('input-number-student-id') as HTMLInputElement
    expect(studentIdInput).toBeDisabled()
    expect(studentIdInput).toHaveValue(12345)
  },
}

/**
 * Readonly number field
 */
export const Readonly: Story = {
  args: {
    initialData: { price: 99.99 },
    schemas: [
      z.object({
        price: z.number().meta({
          label: 'Price',
          placeholder: 'Product price',
          state: 'readonly',
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const priceInput = canvas.getByTestId('input-number-price') as HTMLInputElement
    expect(priceInput).toHaveValue(99.99)
  },
}

/**
 * Multiple number fields
 */
export const MultipleFields: Story = {
  args: {
    schemas: [
      z.object({
        aspectRatio: z.number().optional().meta({
          label: 'Aspect Ratio',
          placeholder: 'Optional: enter aspect ratio',
        }),
        height: z.number().meta({
          label: 'Height (px)',
          placeholder: 'Enter height',
        }),
        width: z.number().meta({
          label: 'Width (px)',
          placeholder: 'Enter width',
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const widthInput = canvas.getByTestId('input-number-width') as HTMLInputElement
    const heightInput = canvas.getByTestId('input-number-height') as HTMLInputElement
    const formData = canvas.getByTestId('debug-data-form-data')
    const submittedData = canvas.getByTestId('debug-data-submitted-data')

    await step('fill width', async () => {
      await userEvent.type(widthInput, '1920')
      expect(widthInput).toHaveValue(1920)
    })

    await step('fill height', async () => {
      await userEvent.type(heightInput, '1080')
      expect(heightInput).toHaveValue(1080)
    })

    await step('verify form data shows both fields', () => {
      expect(formData).toContainHTML(stringify({ height: 1080, width: 1920 }, true))
    })

    await step('submit form', async () => {
      const submitButton = canvas.getByRole('button', { name: 'Submit' })
      await userEvent.click(submitButton)
    })

    await step('verify submitted data', () => {
      const expectedData = {
        height: 1080,
        width: 1920,
      }
      expect(submittedData).toContainHTML(stringify(expectedData, true))
    })
  },
}
