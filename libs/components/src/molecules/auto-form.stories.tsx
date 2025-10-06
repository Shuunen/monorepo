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

const basicSchema = z.object({
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
export const Basic: Story = {
  args: {
    schemas: [basicSchema],
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

const exhaustiveSchema = z.object({
  // Boolean variants
  boolean: z.boolean().meta({
    label: 'Boolean editable required',
    placeholder: 'Some boolean placeholder',
  }),
  booleanDisabled: z.boolean().meta({
    label: 'Boolean disabled required',
    placeholder: 'Some boolean placeholder',
    state: 'disabled',
  }),
  booleanLiteralChecked: z.literal(true).meta({
    label: 'Boolean literal checked',
    placeholder: 'Some boolean placeholder',
  }),
  booleanLiteralUnchecked: z.literal(false).meta({
    label: 'Boolean literal unchecked',
    placeholder: 'Some boolean placeholder',
  }),
  booleanOptional: z.boolean().optional().meta({
    label: 'Boolean optional',
    placeholder: 'Some boolean placeholder',
  }),
  booleanReadonlyChecked: z.literal(true).meta({
    label: 'Boolean readonly checked',
    placeholder: 'Some boolean placeholder',
    state: 'readonly',
  }),
  booleanReadonlyUnchecked: z.boolean().meta({
    label: 'Boolean readonly',
    placeholder: 'Some boolean placeholder',
    state: 'readonly',
  }),
  // Email variants
  email: z.email('Email editable required').meta({
    label: 'Email editable required',
    placeholder: "We'll never share your email",
  }),
  emailDisabled: z.email('Email disabled required').meta({
    label: 'Email disabled required',
    placeholder: 'Disabled email',
    state: 'disabled',
  }),
  emailOptional: z.email('Email optional').optional().meta({
    label: 'Email optional',
    placeholder: 'Optional email',
  }),
  emailReadonly: z.email('Email readonly').meta({
    label: 'Email readonly',
    placeholder: 'Readonly email',
    state: 'readonly',
  }),
  // Enum variants
  enum: z.enum(['red', 'green', 'blue']).meta({
    label: 'Enum editable required',
    placeholder: 'Select your favorite color',
  }),
  enumDisabled: z.enum(['red', 'green', 'blue']).meta({
    label: 'Enum disabled required',
    placeholder: 'Disabled enum',
    state: 'disabled',
  }),
  enumOptional: z.enum(['red', 'green', 'blue']).optional().meta({
    label: 'Enum optional',
    placeholder: 'Optional enum',
  }),
  enumReadonly: z.enum(['red', 'green', 'blue']).meta({
    label: 'Enum readonly',
    placeholder: 'Readonly enum',
    state: 'readonly',
  }),
  // Number variants
  number: z.number().min(0).max(120).meta({
    label: 'Number editable required',
    placeholder: 'Enter your age',
  }),
  numberDisabled: z.number().min(0).max(120).meta({
    label: 'Number disabled required',
    placeholder: 'Disabled number',
    state: 'disabled',
  }),
  numberOptional: z.number().min(0).max(120).optional().meta({
    label: 'Number optional',
    placeholder: 'Optional number',
  }),
  numberReadonly: z.number().min(0).max(120).meta({
    label: 'Number readonly',
    placeholder: 'Readonly number',
    state: 'readonly',
  }),
  // String variants
  string: z.string().meta({
    label: 'String editable required',
    placeholder: 'Some placeholder',
  }),
  stringDisabled: z.string().meta({
    label: 'String disabled required',
    placeholder: 'Some placeholder',
    state: 'disabled',
  }),
  stringOptional: z.string().optional().meta({
    label: 'String optional',
    placeholder: 'Some placeholder',
  }),
  stringReadonly: z.string().meta({
    label: 'String readonly',
    placeholder: 'Some placeholder',
    state: 'readonly',
  }),
})

/**
 * Exhaustive form with all field types
 */
export const Exhaustive: Story = {
  args: {
    schemas: [exhaustiveSchema],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Boolean
    const booleanEditable = canvas.getByTestId('boolean')
    expect(booleanEditable).not.toBeDisabled()
    expect(booleanEditable).not.toBeChecked()
    await userEvent.click(booleanEditable)
    expect(booleanEditable).toBeChecked()
    const booleanDisabled = canvas.getByTestId('boolean-disabled')
    expect(booleanDisabled).toBeDisabled()
    expect(booleanDisabled).not.toBeChecked()
    const booleanLiteralChecked = canvas.getByTestId('boolean-literal-checked')
    expect(booleanLiteralChecked).toBeDisabled()
    expect(booleanLiteralChecked).toBeChecked()
    const booleanLiteralUnchecked = canvas.getByTestId('boolean-literal-unchecked')
    expect(booleanLiteralUnchecked).toBeDisabled()
    expect(booleanLiteralUnchecked).not.toBeChecked()
    const booleanOptional = canvas.getByTestId('boolean-optional')
    expect(booleanOptional).not.toBeDisabled()
    expect(booleanOptional).not.toBeChecked()
    await userEvent.click(booleanOptional)
    expect(booleanOptional).toBeChecked()
    const booleanReadonlyChecked = canvas.getByTestId('boolean-readonly-checked')
    expect(booleanReadonlyChecked).toContainHTML('Yes')
    const booleanReadonlyUnchecked = canvas.getByTestId('boolean-readonly-unchecked')
    expect(booleanReadonlyUnchecked).toContainHTML('No')
    // Email
    const emailEditable = canvas.getByTestId('email')
    await userEvent.type(emailEditable, 'invalid-email')
    expect(emailEditable).toHaveValue('invalid-email')
    const emailDisabled = canvas.getByTestId('email-disabled')
    expect(emailDisabled).toBeDisabled()
    expect(emailDisabled).toHaveValue('')
    const emailOptional = canvas.getByTestId('email-optional')
    expect(emailOptional).toHaveValue('')
    await userEvent.type(emailOptional, 'invalid-email')
    expect(emailOptional).toHaveValue('invalid-email')
    const emailReadonly = canvas.getByTestId('email-readonly')
    expect(emailReadonly).toContainHTML('undefined')
    // check that there is no error displayed
    expect(canvas.queryByRole('alert')).not.toBeInTheDocument()
  },
}
