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
  title: 'Commons/Molecules/FormFieldSelect',
} satisfies Meta<typeof AutoForm>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Basic select with simple enum values
 */
export const Basic: Story = {
  args: {
    schemas: [
      z.object({
        color: z.enum(['red', 'green', 'blue']).meta({
          label: 'Favorite Color',
          placeholder: 'Choose a color',
        }),
      }),
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const canvasBody = within(canvasElement.ownerDocument.body)
    const colorTrigger = canvas.getByTestId('select-trigger-color')
    await userEvent.click(colorTrigger)
    const colorOptions = canvasBody.getAllByRole('option')
    expect(colorOptions[0]).toHaveTextContent('Red')
    expect(colorOptions[1]).toHaveTextContent('Green')
    expect(colorOptions[2]).toHaveTextContent('Blue')
  },
}

/**
 * Enum fields with custom labels demonstrating automatic label generation.
 * Note: The enum values are lowercase, but the labels are automatically capitalized.
 * Multi-word enum values like 'extra-large' are formatted as 'Extra-large'.
 */
export const LabelGeneration: Story = {
  args: {
    schemas: [
      z.object({
        color: z.enum(['red', 'green', 'blue']).meta({
          label: 'Favorite Color',
          placeholder: 'Choose a color',
        }),
        priority: z.enum(['low', 'medium', 'high', 'critical']).meta({
          label: 'Priority Level',
          placeholder: 'Select priority',
        }),
        size: z.enum(['small', 'medium', 'large', 'extra-large']).meta({
          label: 'T-shirt Size',
          placeholder: 'Select your size',
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const canvasBody = within(canvasElement.ownerDocument.body)
    const formData = canvas.getByTestId('debug-data-form-data')
    const submittedData = canvas.getByTestId('debug-data-submitted-data')
    await step('select color option', async () => {
      const colorTrigger = canvas.getByTestId('select-trigger-color')
      await userEvent.click(colorTrigger)
      const colorOptions = canvasBody.getAllByRole('option')
      expect(colorOptions[0]).toHaveTextContent('Red')
      expect(colorOptions[1]).toHaveTextContent('Green')
      expect(colorOptions[2]).toHaveTextContent('Blue')
      await userEvent.click(colorOptions[1])
      const colorNativeSelect = colorTrigger.nextElementSibling
      expect(colorNativeSelect).toHaveValue('green')
    })
    await step('select size option', async () => {
      const sizeTrigger = canvas.getByTestId('select-trigger-size')
      await userEvent.click(sizeTrigger)
      const sizeOptions = canvasBody.getAllByRole('option')
      expect(sizeOptions[0]).toHaveTextContent('Small')
      expect(sizeOptions[1]).toHaveTextContent('Medium')
      expect(sizeOptions[2]).toHaveTextContent('Large')
      expect(sizeOptions[3]).toHaveTextContent('Extra-large')
      await userEvent.click(sizeOptions[2])
      const sizeNativeSelect = sizeTrigger.nextElementSibling
      expect(sizeNativeSelect).toHaveValue('large')
    })
    await step('select priority option', async () => {
      const priorityTrigger = canvas.getByTestId('select-trigger-priority')
      await userEvent.click(priorityTrigger)
      const priorityOptions = canvasBody.getAllByRole('option')
      expect(priorityOptions[0]).toHaveTextContent('Low')
      expect(priorityOptions[1]).toHaveTextContent('Medium')
      expect(priorityOptions[2]).toHaveTextContent('High')
      expect(priorityOptions[3]).toHaveTextContent('Critical')
      await userEvent.click(priorityOptions[3])
      const priorityNativeSelect = priorityTrigger.nextElementSibling
      expect(priorityNativeSelect).toHaveValue('critical')
    })
    await step('submit form', async () => {
      const submitButton = canvas.getByRole('button', { name: 'Submit' })
      await userEvent.click(submitButton)
    })
    await step('verify submitted data', () => {
      const expectedData = {
        color: 'green',
        priority: 'critical',
        size: 'large',
      }
      expect(formData).toContainHTML(stringify(expectedData, true))
      expect(submittedData).toContainHTML(stringify(expectedData, true))
    })
  },
}

/**
 * Optional select field
 */
export const Optional: Story = {
  args: {
    schemas: [
      z.object({
        color: z.enum(['red', 'green', 'blue']).optional().meta({
          label: 'Optional Color',
          placeholder: 'Choose a color',
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
 * Disabled select field
 */
export const Disabled: Story = {
  args: {
    initialData: { color: 'green' },
    schemas: [
      z.object({
        color: z.enum(['red', 'green', 'blue']).meta({
          label: 'Disabled Color',
          placeholder: 'Choose a color',
          state: 'disabled',
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const colorTrigger = canvas.getByTestId('select-trigger-color')
    expect(colorTrigger).toBeDisabled()
    const colorNativeSelect = colorTrigger.nextElementSibling
    expect(colorNativeSelect).toHaveValue('green')
  },
}

/**
 * Readonly select field
 */
export const Readonly: Story = {
  args: {
    initialData: { color: 'blue' },
    schemas: [
      z.object({
        color: z.enum(['red', 'green', 'blue']).meta({
          label: 'Readonly Color',
          placeholder: 'Choose a color',
          state: 'readonly',
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const colorTrigger = canvas.getByTestId('select-trigger-color')
    const colorNativeSelect = colorTrigger.nextElementSibling
    expect(colorNativeSelect).toHaveValue('blue')
  },
}

/**
 * Custom label/value pairs for select options
 */
export const CustomLabels: Story = {
  args: {
    schemas: [
      z.object({
        country: z.enum(['us', 'uk', 'fr', 'de', 'jp']).meta({
          label: 'Country',
          options: [
            { label: '🇺🇸 United States', value: 'us' },
            { label: '🇬🇧 United Kingdom', value: 'uk' },
            { label: '🇫🇷 France', value: 'fr' },
            { label: '🇩🇪 Germany', value: 'de' },
            { label: '🇯🇵 Japan', value: 'jp' },
          ],
          placeholder: 'Select your country',
        }),
        size: z.enum(['xs', 'sm', 'md', 'lg', 'xl']).meta({
          label: 'Size',
          options: [
            { label: 'Extra Small (XS)', value: 'xs' },
            { label: 'Small (S)', value: 'sm' },
            { label: 'Medium (M)', value: 'md' },
            { label: 'Large (L)', value: 'lg' },
            { label: 'Extra Large (XL)', value: 'xl' },
          ],
          placeholder: 'Select your size',
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const canvasBody = within(canvasElement.ownerDocument.body)
    const formData = canvas.getByTestId('debug-data-form-data')
    const submittedData = canvas.getByTestId('debug-data-submitted-data')
    await step('select country option', async () => {
      const countryTrigger = canvas.getByTestId('select-trigger-country')
      await userEvent.click(countryTrigger)
      const countryOptions = canvasBody.getAllByRole('option')
      expect(countryOptions[0]).toHaveTextContent('🇺🇸 United States')
      expect(countryOptions[1]).toHaveTextContent('🇬🇧 United Kingdom')
      expect(countryOptions[2]).toHaveTextContent('🇫🇷 France')
      await userEvent.click(countryOptions[2])
      const countryNativeSelect = countryTrigger.nextElementSibling
      expect(countryNativeSelect).toHaveValue('fr')
    })
    await step('select size option', async () => {
      const sizeTrigger = canvas.getByTestId('select-trigger-size')
      await userEvent.click(sizeTrigger)
      const sizeOptions = canvasBody.getAllByRole('option')
      expect(sizeOptions[0]).toHaveTextContent('Extra Small (XS)')
      expect(sizeOptions[2]).toHaveTextContent('Medium (M)')
      expect(sizeOptions[4]).toHaveTextContent('Extra Large (XL)')
      await userEvent.click(sizeOptions[3])
      const sizeNativeSelect = sizeTrigger.nextElementSibling
      expect(sizeNativeSelect).toHaveValue('lg')
    })
    await step('submit form', async () => {
      const submitButton = canvas.getByRole('button', { name: 'Submit' })
      await userEvent.click(submitButton)
    })
    await step('verify submitted data', () => {
      const expectedData = {
        country: 'fr',
        size: 'lg',
      }
      expect(formData).toContainHTML(stringify(expectedData, true))
      expect(submittedData).toContainHTML(stringify(expectedData, true))
    })
  },
}
