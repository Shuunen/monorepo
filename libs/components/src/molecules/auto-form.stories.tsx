import { isBrowserEnvironment, Logger, sleep } from '@monorepo/utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { z } from 'zod'
import { AutoForm } from './auto-form'
import { DebugData, stringify } from './debug-data'

// allow dev to see logs in the browser console when running storybook dev but not in headless tests
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
        <DebugData data={formData} title="Form data" />
        <AutoForm {...args} logger={logger} onChange={onChange} onSubmit={onSubmit} />
        <DebugData data={submittedData} title="Submitted data" />
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
    const formData = canvas.getByTestId('debug-data-form-data')
    const submittedData = canvas.getByTestId('debug-data-submitted-data')
    const submitButton = canvas.getByRole('button', { name: 'Submit' })
    // Initially submit button should be disabled (form is empty)
    expect(submitButton).toBeDisabled()
    const emailInput = canvas.getByTestId('email')
    await userEvent.type(emailInput, 'example-email@email.com')
    // Still disabled - name is missing
    expect(submitButton).toBeDisabled()
    const nameInput = canvas.getByTestId('name')
    await userEvent.type(nameInput, 'John Doe')
    // Now enabled - form is valid
    expect(submitButton).not.toBeDisabled()
    await userEvent.click(submitButton)
    await expect(formData).toContainHTML(stringify({ email: 'example-email@email.com', name: 'John Doe' }))
    await expect(submittedData).toContainHTML(stringify({ email: 'example-email@email.com', name: 'John Doe' }))
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
 * Exhaustive form with all field types, empty by default
 */
export const Exhaustive: Story = {
  args: {
    schemas: [exhaustiveSchema],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const canvasBody = within(canvasElement.ownerDocument.body)
    const formData = canvas.getByTestId('debug-data-form-data')
    const submittedData = canvas.getByTestId('debug-data-submitted-data')
    await step('boolean fields', async () => {
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
      expect(booleanReadonlyChecked).toBeChecked()
      const booleanReadonlyUnchecked = canvas.getByTestId('boolean-readonly-unchecked')
      expect(booleanReadonlyUnchecked).not.toBeChecked()
    })
    await step('email fields', async () => {
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
      expect(emailReadonly).toHaveValue('')
    })
    await step('enum fields', async () => {
      const enumEditable = canvas.getByTestId('enum-trigger')
      await userEvent.click(enumEditable)
      const enumEditableOptions = canvasBody.getAllByRole('option')
      await userEvent.click(enumEditableOptions[0])
      const enumEditableNativeSelect = enumEditable.nextElementSibling
      expect(enumEditableNativeSelect).toHaveValue('red')
      const enumDisabled = canvas.getByTestId('enum-disabled-trigger')
      expect(enumDisabled).toBeDisabled()
      const enumOptional = canvas.getByTestId('enum-optional-trigger')
      expect(enumOptional).toHaveValue('')
      await userEvent.click(enumOptional)
      const enumOptionalOptions = canvasBody.getAllByRole('option')
      await userEvent.click(enumOptionalOptions[1])
      const enumOptionalNativeSelect = enumOptional.nextElementSibling
      expect(enumOptionalNativeSelect).toHaveValue('green')
      const enumReadonly = canvas.getByTestId('enum-readonly-trigger')
      expect(enumReadonly).toHaveValue('')
    })
    await step('number fields', async () => {
      const numberEditable = canvas.getByTestId('number')
      await userEvent.type(numberEditable, '25')
      expect(numberEditable).toHaveValue(25)
      const numberDisabled = canvas.getByTestId('number-disabled')
      expect(numberDisabled).toBeDisabled()
      expect(numberDisabled).toHaveValue(null)
      const numberOptional = canvas.getByTestId('number-optional')
      expect(numberDisabled).toHaveValue(null)
      await userEvent.type(numberOptional, '30')
      expect(numberOptional).toHaveValue(30)
      const numberReadonly = canvas.getByTestId('number-readonly')
      expect(numberReadonly).toHaveValue(null)
    })
    await step('string fields', async () => {
      const stringEditable = canvas.getByTestId('string')
      await userEvent.type(stringEditable, 'Some text')
      expect(stringEditable).toHaveValue('Some text')
      const stringDisabled = canvas.getByTestId('string-disabled')
      expect(stringDisabled).toBeDisabled()
      expect(stringDisabled).toHaveValue('')
      const stringOptional = canvas.getByTestId('string-optional')
      expect(stringOptional).toHaveValue('')
      await userEvent.type(stringOptional, 'Some text')
      expect(stringOptional).toHaveValue('Some text')
      const stringReadonly = canvas.getByTestId('string-readonly')
      expect(stringReadonly).toHaveValue('')
    })
    step('submit button is disabled because form is invalid', () => {
      const submitButton = canvas.getByRole('button', { name: 'Submit' })
      expect(submitButton).toBeDisabled()
      const issues = canvas.getAllByRole('alert')
      expect(issues).toHaveLength(2)
      const expectedErrorMessages = ['Email editable required', 'Email optional']
      const errorMessages = issues.map(i => i.textContent?.trim())
      expect(errorMessages).toEqual(expectedErrorMessages)
    })
    step('check form data and submitted data', () => {
      expect(formData).toContainHTML(
        stringify({
          boolean: true,
          booleanOptional: true,
          email: 'invalid-email',
          emailOptional: 'invalid-email',
          enum: 'red',
          enumOptional: 'green',
          number: 25,
          numberOptional: 30,
          string: 'Some text',
          stringOptional: 'Some text',
        }),
      )
      expect(submittedData).toContainHTML('{}')
    })
  },
}

/**
 * Exhaustive form with all field types, filled by default
 */
export const ExhaustiveFilled: Story = {
  args: {
    initialData: {
      boolean: true,
      booleanDisabled: true,
      booleanLiteralChecked: true,
      booleanLiteralUnchecked: false,
      // booleanOptional: true,
      booleanReadonlyChecked: true,
      booleanReadonlyUnchecked: false,
      email: 'test@example.com',
      emailDisabled: 'test@disabled.de',
      // emailOptional: 'test@optional.fr',
      emailReadonly: 'test@readonly.bzh',
      enum: 'blue',
      enumDisabled: 'green',
      // enumOptional: 'red',
      enumReadonly: 'blue',
      number: 45,
      numberDisabled: 99,
      // numberOptional: 30,
      numberReadonly: 60,
      string: 'Some text',
      stringDisabled: 'Some text disabled',
      // stringOptional: 'Some text optional',
      stringReadonly: 'Some text readonly',
    },
    schemas: [exhaustiveSchema],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const formData = canvas.getByTestId('debug-data-form-data')
    const submittedData = canvas.getByTestId('debug-data-submitted-data')
    await step('boolean fields', () => {
      const booleanEditable = canvas.getByTestId('boolean')
      expect(booleanEditable).not.toBeDisabled()
      expect(booleanEditable).toBeChecked()
      const booleanDisabled = canvas.getByTestId('boolean-disabled')
      expect(booleanDisabled).toBeDisabled()
      expect(booleanDisabled).toBeChecked()
      const booleanLiteralChecked = canvas.getByTestId('boolean-literal-checked')
      expect(booleanLiteralChecked).toBeDisabled()
      expect(booleanLiteralChecked).toBeChecked()
      const booleanLiteralUnchecked = canvas.getByTestId('boolean-literal-unchecked')
      expect(booleanLiteralUnchecked).toBeDisabled()
      expect(booleanLiteralUnchecked).not.toBeChecked()
      const booleanOptional = canvas.getByTestId('boolean-optional')
      expect(booleanOptional).not.toBeDisabled()
      expect(booleanOptional).not.toBeChecked()
      const booleanReadonlyChecked = canvas.getByTestId('boolean-readonly-checked')
      expect(booleanReadonlyChecked).toBeChecked()
      const booleanReadonlyUnchecked = canvas.getByTestId('boolean-readonly-unchecked')
      expect(booleanReadonlyUnchecked).not.toBeChecked()
    })
    await step('email fields', () => {
      const emailEditable = canvas.getByTestId('email')
      expect(emailEditable).toHaveValue('test@example.com')
      const emailDisabled = canvas.getByTestId('email-disabled')
      expect(emailDisabled).toBeDisabled()
      expect(emailDisabled).toHaveValue('test@disabled.de')
      const emailOptional = canvas.getByTestId('email-optional')
      expect(emailOptional).toHaveValue('')
      const emailReadonly = canvas.getByTestId('email-readonly')
      expect(emailReadonly).toHaveValue('test@readonly.bzh')
    })
    await step('enum fields', () => {
      const enumEditable = canvas.getByTestId('enum-trigger')
      const enumEditableNativeSelect = enumEditable.nextElementSibling
      expect(enumEditableNativeSelect).toHaveValue('blue')
      const enumDisabled = canvas.getByTestId('enum-disabled-trigger')
      expect(enumDisabled).toBeDisabled()
      const enumDisabledNativeSelect = enumDisabled.nextElementSibling
      expect(enumDisabledNativeSelect).toHaveValue('green')
      const enumOptional = canvas.getByTestId('enum-optional-trigger')
      expect(enumOptional).toHaveValue('')
      const enumOptionalNativeSelect = enumOptional.nextElementSibling
      expect(enumOptionalNativeSelect).toHaveValue('')
      const enumReadonly = canvas.getByTestId('enum-readonly-trigger')
      const enumReadonlyNativeSelect = enumReadonly.nextElementSibling
      expect(enumReadonlyNativeSelect).toHaveValue('blue')
    })
    await step('number fields', () => {
      const numberEditable = canvas.getByTestId('number')
      expect(numberEditable).toHaveValue(45)
      const numberDisabled = canvas.getByTestId('number-disabled')
      expect(numberDisabled).toBeDisabled()
      expect(numberDisabled).toHaveValue(99)
      const numberOptional = canvas.getByTestId('number-optional')
      expect(numberOptional).toHaveValue(null)
      const numberReadonly = canvas.getByTestId('number-readonly')
      expect(numberReadonly).toHaveValue(60)
    })
    await step('string fields', () => {
      const stringEditable = canvas.getByTestId('string')
      expect(stringEditable).toHaveValue('Some text')
      const stringDisabled = canvas.getByTestId('string-disabled')
      expect(stringDisabled).toBeDisabled()
      expect(stringDisabled).toHaveValue('Some text disabled')
      const stringOptional = canvas.getByTestId('string-optional')
      expect(stringOptional).toHaveValue('')
      const stringReadonly = canvas.getByTestId('string-readonly')
      expect(stringReadonly).toHaveValue('Some text readonly')
    })
    step('no error displayed', () => {
      expect(canvas.queryByRole('alert')).not.toBeInTheDocument()
    })
    await step('submit button is enabled because form is valid', async () => {
      const submitButton = canvas.getByRole('button', { name: 'Submit' })
      expect(submitButton).not.toBeDisabled()
      await userEvent.click(submitButton)
      await sleep(100)
    })
    step('verify submitted data', () => {
      const expectedData = {
        boolean: true,
        booleanDisabled: true,
        booleanLiteralChecked: true,
        booleanLiteralUnchecked: false,
        booleanReadonlyChecked: true,
        booleanReadonlyUnchecked: false,
        email: 'test@example.com',
        emailDisabled: 'test@disabled.de',
        emailReadonly: 'test@readonly.bzh',
        enum: 'blue',
        enumDisabled: 'green',
        enumReadonly: 'blue',
        number: 45,
        numberDisabled: 99,
        numberReadonly: 60,
        string: 'Some text',
        stringDisabled: 'Some text disabled',
        stringReadonly: 'Some text readonly',
      }
      expect(formData).toContainHTML(stringify(expectedData))
      expect(submittedData).toContainHTML(stringify(expectedData))
    })
  },
}

const step1Schema = z.object({
  email: z.email('Invalid email address').meta({
    label: 'Email Address',
    placeholder: "We'll never share your email",
  }),
  name: z.string().min(2, 'Name is required').meta({
    label: 'Full Name',
    placeholder: 'Enter your legal name',
  }),
})

const step2Schema = z.object({
  age: z.number().min(0).max(120).optional().meta({
    label: 'Age',
    placeholder: 'Enter your age',
  }),
  subscribe: z.boolean().meta({
    label: 'Subscribe to newsletter',
    placeholder: 'Check to subscribe',
  }),
})

const step3Schema = z.object({
  address: z.string().min(5, 'Address is required').meta({
    label: 'Street Address',
    placeholder: 'Enter your street address',
  }),
  city: z.string().min(2, 'City is required').meta({
    label: 'City',
    placeholder: 'Enter your city',
  }),
})

/**
 * 3 steps form with basic fields.
 * Tests navigation between steps (Next button bypasses validation).
 */
export const MultiStep: Story = {
  args: {
    schemas: [step1Schema, step2Schema, step3Schema],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const formData = canvas.getByTestId('debug-data-form-data')
    const submittedData = canvas.getByTestId('debug-data-submitted-data')
    await step('navigate to step 2 without filling step 1 (validation bypassed)', async () => {
      // Click Next without filling any fields - should work
      const nextButton = canvas.getByRole('button', { name: 'Next' })
      await userEvent.click(nextButton)
      // We should be on step 2 now
      const ageInput = canvas.getByTestId('age')
      expect(ageInput).toBeInTheDocument()
    })
    await step('navigate to step 3 without filling step 2 (validation bypassed)', async () => {
      // Click Next without filling step 2 fields - should work
      const nextButton = canvas.getByRole('button', { name: 'Next' })
      await userEvent.click(nextButton)
      // We should be on step 3 now - verify all fields are present
      const addressInput = canvas.getByTestId('address')
      expect(addressInput).toBeInTheDocument()
      const cityInput = canvas.getByTestId('city')
      expect(cityInput).toBeInTheDocument()
      const submitButton = canvas.getByRole('button', { name: 'Submit' })
      expect(submitButton).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })
    await step('go back to step 1 and fill fields', async () => {
      const step1Button = canvas.getByRole('button', { name: 'Step 1' })
      await userEvent.click(step1Button)
      const nameInput = canvas.getByTestId('name')
      await userEvent.type(nameInput, 'John Doe')
      const emailInput = canvas.getByTestId('email')
      await userEvent.type(emailInput, 'john.doe@example.com')
    })
    await step('submit button still disabled - step 2 & 3 not filled', async () => {
      const step3Button = canvas.getByRole('button', { name: 'Step 3' })
      await userEvent.click(step3Button)
      const submitButton = canvas.getByRole('button', { name: 'Submit' })
      expect(submitButton).toBeDisabled()
    })
    await step('step 2 - fill fields', async () => {
      const stepBackButton = canvas.getByRole('button', { name: 'Step 2' })
      await userEvent.click(stepBackButton)
      const ageInput = canvas.getByTestId('age')
      await userEvent.type(ageInput, '30')
      const subscribeCheckbox = canvas.getByTestId('subscribe')
      await userEvent.click(subscribeCheckbox)
      const nextButton = canvas.getByRole('button', { name: 'Next' })
      await userEvent.click(nextButton)
    })
    step('submit button still disabled - step 3 not filled', () => {
      const submitButton = canvas.getByRole('button', { name: 'Submit' })
      expect(submitButton).toBeDisabled()
    })
    await step('step 3 - fill fields and submit', async () => {
      const addressInput = canvas.getByTestId('address')
      await userEvent.type(addressInput, '123 Main St')
      const cityInput = canvas.getByTestId('city')
      await userEvent.type(cityInput, 'Metropolis')
      const submitButton = canvas.getByRole('button', { name: 'Submit' })
      expect(submitButton).not.toBeDisabled()
      await userEvent.click(submitButton)
    })
    step('verify submitted data', () => {
      // biome-ignore assist/source/useSortedKeys: should not sort keys here
      const expectedData = {
        email: 'john.doe@example.com',
        name: 'John Doe',
        age: 30,
        subscribe: true,
        address: '123 Main St',
        city: 'Metropolis',
      }
      expect(formData).toContainHTML(stringify(expectedData))
      expect(submittedData).toContainHTML(stringify(expectedData))
    })
  },
}

const optionalSectionStep1Schema = z
  // biome-ignore assist/source/useSortedKeys: we need a specific key order here
  .object({
    name: z.string().min(2, 'Name is required').meta({
      label: 'Full Name',
      placeholder: 'Enter your legal name',
    }),
    age: z.number().min(0).max(120).optional().meta({
      label: 'Age',
      placeholder: 'Enter your age',
    }),
  })
  .meta({
    step: 'My infos',
  })

const optionalSectionStep2Schema = z
  // biome-ignore assist/source/useSortedKeys: we need a specific key order here
  .object({
    hasPet: z.boolean().optional().meta({
      excluded: true, // avoid including this field in the final submitted data
      label: 'Do you have a pet ?',
      placeholder: 'Check if you have a pet',
    }),
    petName: z.string().min(2, 'Pet name is required').meta({
      dependsOn: 'hasPet', // this field depends on the truthiness of "hasPet" field
      label: 'Pet Name',
      placeholder: 'Enter your pet name',
    }),
    petAge: z.number().min(0).max(50).optional().meta({
      dependsOn: 'hasPet', // this field depends on the truthiness of "hasPet" field
      label: 'Pet Age',
      placeholder: 'Enter your pet age if you know it',
    }),
  })
  .meta({
    step: 'My pet',
  })

/**
 * Schema with an optional section
 * If hasPet is checked/true, petName & petAge becomes visible and active (required if not optional)
 * If hasPet is unchecked/false, petName & petAge are hidden and inactive (not part of the final submitted data)
 * The hasPet field is not part of the final data submitted as it is marked with meta: { excluded: true }
 * In this example, the final submitted data will either be { name: "John" } or { name: "John", petName: "Fido" }
 */
export const OptionalSection: Story = {
  args: {
    initialData: { age: 28, name: 'Jane Doe' },
    schemas: [optionalSectionStep1Schema, optionalSectionStep2Schema],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const formData = canvas.getByTestId('debug-data-form-data')
    const submittedData = canvas.getByTestId('debug-data-submitted-data')
    await step('fill name', async () => {
      const step1Title = canvas.getByTestId('step-title')
      expect(step1Title).toHaveTextContent('My infos')
      const nameInput = canvas.getByTestId('name')
      await userEvent.type(nameInput, 'John Doe')
      const nextButton = canvas.getByRole('button', { name: 'Next' })
      await userEvent.click(nextButton)
      const step2Title = canvas.getByTestId('step-title')
      expect(step2Title).toHaveTextContent('My pet')
    })
    await step('go back to step 1 to fix the name', async () => {
      const backButton = canvas.getByRole('button', { name: 'Back' })
      await userEvent.click(backButton)
      const nameInput = canvas.getByTestId('name')
      await userEvent.clear(nameInput)
      await userEvent.type(nameInput, 'John Doughy')
      const nextButton = canvas.getByRole('button', { name: 'Next' })
      await userEvent.click(nextButton)
    })
    await step('succeed at submitting without pet', async () => {
      const submitButton = canvas.getByRole('button', { name: 'Submit' })
      await userEvent.click(submitButton)
      // biome-ignore assist/source/useSortedKeys: we need a specific key order here
      const expectedData = {
        name: 'John Doughy',
        age: 28,
      }
      expect(formData).toContainHTML(stringify(expectedData))
      expect(submittedData).toContainHTML(stringify(expectedData))
    })
    await step('show pet name field', async () => {
      const hasPetCheckbox = canvas.getByTestId('has-pet')
      await userEvent.click(hasPetCheckbox)
      const petNameInput = await canvas.findByTestId('pet-name')
      expect(petNameInput).toBeVisible()
    })
    step('submit button disabled when pet checked but no pet name', () => {
      const submitButton = canvas.getByRole('button', { name: 'Submit' })
      expect(submitButton).toBeDisabled()
    })
    await step('fill pet name', async () => {
      const petNameInput = await canvas.findByTestId('pet-name')
      await userEvent.type(petNameInput, 'Fido')
    })
    await step('submit button enabled and submit successfully', async () => {
      const submitButton = canvas.getByRole('button', { name: 'Submit' })
      expect(submitButton).not.toBeDisabled()
      await userEvent.click(submitButton)
      // biome-ignore assist/source/useSortedKeys: we need a specific key order here
      const expectedData = {
        name: 'John Doughy',
        age: 28,
        petName: 'Fido',
      }
      expect(formData).toContainHTML(stringify(expectedData))
      expect(submittedData).toContainHTML(stringify(expectedData))
    })
    await step('uncheck hasPet to hide pet fields', async () => {
      const hasPetCheckbox = canvas.getByTestId('has-pet')
      await userEvent.click(hasPetCheckbox)
      expect(canvas.queryByTestId('pet-name')).not.toBeInTheDocument()
      expect(canvas.queryByTestId('pet-age')).not.toBeInTheDocument()
      const submitButton = canvas.getByRole('button', { name: 'Submit' })
      await userEvent.click(submitButton)
    })
    step('verify submitted data', () => {
      expect(formData).toContainHTML(
        // biome-ignore assist/source/useSortedKeys: we need a specific key order here
        stringify({
          name: 'John Doughy',
          age: 28,
          petName: 'Fido',
        }),
      )
      expect(submittedData).toContainHTML(
        // biome-ignore assist/source/useSortedKeys: we need a specific key order here
        stringify({
          name: 'John Doughy',
          age: 28,
        }),
      )
    })
  },
}

const editableStep1Schema = z
  // biome-ignore assist/source/useSortedKeys: we need a specific key order here
  .object({
    name: z.string().min(2, 'Name is required').meta({
      label: 'Full Name',
      placeholder: 'Enter your legal name',
    }),
    age: z.number().min(0).max(120).meta({
      label: 'Age',
      placeholder: 'Enter your age',
      state: 'readonly',
    }),
  })
  .meta({
    step: 'My infos',
  })

const readonlyStep2Schema = z
  // biome-ignore assist/source/useSortedKeys: we need a specific key order here
  .object({
    petName: z.string().min(2, 'Pet name is required').meta({
      label: 'Pet Name',
      placeholder: 'Enter your pet name',
      state: 'readonly',
    }),
    petAge: z.number().min(0).max(50).optional().meta({
      label: 'Pet Age',
      placeholder: 'Enter your pet age',
      state: 'readonly',
    }),
  })
  .meta({
    step: 'My pet',
  })

/**
 * Story to test stepper icons in different states (editable, readonly, completed)
 */
export const StepperStates: Story = {
  args: {
    initialData: { age: 28, name: 'Jane Doe', petName: 'Fido' },
    schemas: [editableStep1Schema, readonlyStep2Schema],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const formData = canvas.getByTestId('debug-data-form-data')
    const submittedData = canvas.getByTestId('debug-data-submitted-data')
    await step('fill step 1', async () => {
      const currentStepButton = canvas.getByTestId('step-my-infos')
      expect(currentStepButton).toHaveAttribute('data-state', 'editable')
      const nameInput = canvas.getByTestId('name')
      expect(nameInput).toHaveValue('Jane Doe')
      await userEvent.type(nameInput, '-Rollin')
      await userEvent.tab()
      expect(currentStepButton).toHaveAttribute('data-state', 'success')
      const secondStepButton = canvas.getByTestId('step-my-pet')
      expect(secondStepButton).toHaveAttribute('data-state', 'readonly')
    })
    await step('verify step 2 readonly fields', async () => {
      const secondStepButton = canvas.getByRole('button', { name: 'My pet' })
      await userEvent.click(secondStepButton)
      const petNameInput = canvas.getByTestId('pet-name')
      expect(petNameInput).toBeInTheDocument()
      expect(petNameInput).toHaveAttribute('readonly')
      expect(petNameInput).toHaveValue('Fido')
      const submitButton = canvas.getByRole('button', { name: 'Submit' })
      await userEvent.click(submitButton)
    })
    step('verify submitted data', () => {
      // biome-ignore assist/source/useSortedKeys: we need a specific key order here
      const expectedFormData = {
        name: 'Jane Doe-Rollin',
        age: 28,
        petName: 'Fido',
      }
      expect(formData).toContainHTML(stringify(expectedFormData))
      expect(submittedData).toContainHTML(stringify(expectedFormData))
    })
  },
}

/**
 * Key mapping with key, keyIn and keyOut properties
 */
export const KeyMapping: Story = {
  args: {
    initialData: {
      // biome-ignore lint/style/useNamingConvention: we use snake_case for testing purposes
      email_address: 'jane.doe@example.com',
      'userName-Input': 'Jane Doe',
    },
    schemas: [
      z.object({
        userEmail: z.email('Invalid email address').meta({
          key: 'email_address', // Maps initialData.email_address to userEmail field and back to email_address in output
          label: 'Email Address',
          placeholder: "We'll never share your email",
        }),
        userName: z.string().min(2, 'Name is required').meta({
          keyIn: 'userName-Input', // Maps initialData.full_name to userName field
          keyOut: 'user-name-output', // Maps userName field back to full_name in output
          label: 'Full Name',
          placeholder: 'Enter your legal name',
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const formData = canvas.getByTestId('debug-data-form-data')
    const submittedData = canvas.getByTestId('debug-data-submitted-data')
    step('verify initial data was mapped correctly', () => {
      const emailInput = canvas.getByTestId('user-email')
      expect(emailInput).toHaveValue('jane.doe@example.com')
      const nameInput = canvas.getByTestId('user-name')
      expect(nameInput).toHaveValue('Jane Doe')
    })
    await step('submit and verify output uses mapped keys', async () => {
      const submitButton = canvas.getByRole('button', { name: 'Submit' })
      await userEvent.click(submitButton)
    })
    step('verify submitted data', () => {
      const expectedData = {
        // biome-ignore lint/style/useNamingConvention: we use snake_case for testing purposes
        email_address: 'jane.doe@example.com',
        'user-name-output': 'Jane Doe',
      }
      expect(formData).toContainHTML(stringify(expectedData))
      expect(submittedData).toContainHTML(stringify(expectedData))
    })
  },
}

/*
TODO :
- Extract steps logic to utils and add unit tests
- What about the hidden steps like submission and summary ?
- Stepper should contains links and not buttons
- Display an error icon if touched
- Integrate with a store
- Write a story where we feed the AutoForm a whole new schema after a variant change (for dynamic schemas)

We want to be able to use <AutoForm /> as a black box, he will take care of everything regarding the form :
- AutoFormStepper : display the vertical menu on the left with the steps and their states (editable, readonly, completed, error)
- AutoFormFields : display the fields of the current step
- AutoFormNavigation : display the navigation buttons (next, back, submit)
- AutoFormSummaryStep : display a summary of the data to be submitted and ask for confirmation
- AutoFormSubmissionStep : display the submission state (submitting, success, error)
*/
