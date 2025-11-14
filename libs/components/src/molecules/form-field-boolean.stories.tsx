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
  title: 'molecules/FormFieldBoolean',
} satisfies Meta<typeof AutoForm>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Basic boolean field with switch (E2E: toggle and submit)
 */
export const Basic: Story = {
  args: {
    schemas: [
      z.object({
        agreedToTerms: z.boolean().meta({
          label: 'I agree to the Terms and Conditions',
          placeholder: 'Please accept the terms',
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const toggleSwitch = canvas.getByRole('switch')

    expect(toggleSwitch).toBeInTheDocument()

    await step('toggle switch to true', async () => {
      await userEvent.click(toggleSwitch)
      expect(toggleSwitch).toHaveAttribute('aria-checked', 'true')
    })

    await step('submit form', async () => {
      const submitButton = canvas.getByRole('button', { name: 'Submit' })
      await userEvent.click(submitButton)
    })
  },
}

/**
 * Boolean field with initial true value (E2E: verify initial state and toggle)
 */
export const WithInitialValueTrue: Story = {
  args: {
    initialData: { enableNotifications: true },
    schemas: [
      z.object({
        enableNotifications: z.boolean().meta({
          label: 'Enable Email Notifications',
          placeholder: 'Receive email updates',
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const toggleSwitch = canvas.getByRole('switch')
    const formData = canvas.getByTestId('debug-data-form-data')
    const submittedData = canvas.getByTestId('debug-data-submitted-data')

    await step('verify initial value is true', () => {
      expect(toggleSwitch).toHaveAttribute('aria-checked', 'true')
    })

    await step('verify form data shows true', () => {
      expect(formData).toContainHTML(stringify({ enableNotifications: true }, true))
    })

    await step('submit form with initial value', async () => {
      const submitButton = canvas.getByRole('button', { name: 'Submit' })
      await userEvent.click(submitButton)
    })

    await step('verify submitted data matches initial value', () => {
      expect(submittedData).toContainHTML(stringify({ enableNotifications: true }, true))
    })
  },
}

/**
 * Boolean field with initial false value
 */
export const WithInitialValueFalse: Story = {
  args: {
    initialData: { shareData: false },
    schemas: [
      z.object({
        shareData: z.boolean().meta({
          label: 'Share anonymized data with partners',
          placeholder: 'Help improve our service',
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const toggleSwitch = canvas.getByRole('switch')
    expect(toggleSwitch).toHaveAttribute('aria-checked', 'false')
  },
}

/**
 * Optional boolean field
 */
export const Optional: Story = {
  args: {
    schemas: [
      z.object({
        subscribe: z.boolean().optional().meta({
          label: 'Subscribe to newsletter',
          placeholder: 'Optional subscription',
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
 * Disabled boolean field with true value
 */
export const DisabledTrue: Story = {
  args: {
    initialData: { verified: true },
    schemas: [
      z.object({
        verified: z.boolean().meta({
          label: 'Account Verified',
          placeholder: 'Your account status',
          state: 'disabled',
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const toggleSwitch = canvas.getByRole('switch')
    expect(toggleSwitch).toBeDisabled()
    expect(toggleSwitch).toHaveAttribute('aria-checked', 'true')
  },
}

/**
 * Disabled boolean field with false value
 */
export const DisabledFalse: Story = {
  args: {
    initialData: { suspended: false },
    schemas: [
      z.object({
        suspended: z.boolean().meta({
          label: 'Account Suspended',
          placeholder: 'Your account status',
          state: 'disabled',
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const toggleSwitch = canvas.getByRole('switch')
    expect(toggleSwitch).toBeDisabled()
    expect(toggleSwitch).toHaveAttribute('aria-checked', 'false')
  },
}

/**
 * Multiple boolean fields
 */
export const MultipleFields: Story = {
  args: {
    schemas: [
      z.object({
        acceptCookies: z.boolean().meta({
          label: 'Accept Cookies',
          placeholder: 'Enable cookies for better experience',
        }),
        marketingEmails: z.boolean().optional().meta({
          label: 'Marketing Emails',
          placeholder: 'Receive promotional offers',
        }),
        rememberMe: z.boolean().meta({
          label: 'Remember Me',
          placeholder: 'Keep me logged in',
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const switches = canvas.getAllByRole('switch')
    const formData = canvas.getByTestId('debug-data-form-data')
    const submittedData = canvas.getByTestId('debug-data-submitted-data')
    await step('toggle acceptCookies to true', async () => {
      await userEvent.click(switches[0])
      expect(switches[0]).toHaveAttribute('aria-checked', 'true')
    })
    await step('toggle rememberMe to true', async () => {
      await userEvent.click(switches[2])
      expect(switches[2]).toHaveAttribute('aria-checked', 'true')
    })
    await step('verify form data shows both as true', () => {
      expect(formData).toContainHTML(stringify({ acceptCookies: true, rememberMe: true }, true))
    })
    await step('submit form', async () => {
      const submitButton = canvas.getByRole('button', { name: 'Submit' })
      await userEvent.click(submitButton)
    })
    await step('verify submitted data', () => {
      const expectedData = {
        acceptCookies: true,
        rememberMe: true,
      }
      expect(submittedData).toContainHTML(stringify(expectedData, true))
    })
  },
}

/**
 * Boolean literal field (always true, cannot be changed)
 */
export const BooleanLiteral: Story = {
  args: {
    schemas: [
      z.object({
        isPublished: z.literal(true).meta({
          label: 'Published',
          placeholder: 'This item is published',
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const toggleSwitch = canvas.getByRole('switch')
    expect(toggleSwitch).toBeDisabled()
    expect(toggleSwitch).toHaveAttribute('aria-checked', 'true')
  },
}
