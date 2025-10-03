// oxlint-disable no-magic-numbers
import { useMemo } from 'react'
import { z } from 'zod'
import { AutoForm } from '../../components/molecules/auto-form'
import { logger } from '../../utils/logger.utils'

const step1Schema = z.object({
  // Number field
  age: z.number().min(0).max(120).meta({
    label: 'Age (number required)',
    placeholder: 'Enter your age',
  }),
  // Literal boolean field
  agree: z.literal(true).meta({
    label: 'Agree to Terms (literal/boolean required to be checked)',
    placeholder: 'You must agree',
  }),
  // Enum/select field
  color: z.enum(['red', 'green', 'blue']).meta({
    label: 'Favorite Color (enum/select required)',
    placeholder: 'Select your favorite color',
  }),
  // Textarea field (min length > 10)
  description: z.string().min(10, 'Description must be long').meta({
    label: 'Description (text input, required)',
    placeholder: 'Enter a long description',
  }),
  // Disabled field
  disabledField: z.string().meta({
    label: 'Disabled Field (text input, disabled)',
    placeholder: 'This is disabled',
    state: 'disabled',
  }),
  // Email field
  email: z.email('Invalid email address').meta({
    label: 'Email Address (email required)',
    placeholder: "We'll never share your email",
  }),
  // Optional field
  nickname: z.string().optional().meta({
    label: 'Nickname (text input, optional)',
    placeholder: 'Optional nickname',
  }),
  // Readonly field
  readonlyField: z.string().meta({
    label: 'Readonly Field (text input, readonly)',
    placeholder: 'This is readonly',
    state: 'readonly',
  }),
  // Boolean field
  subscribe: z.boolean().meta({
    label: 'Subscribe to newsletter (boolean, required)',
    placeholder: 'Check to subscribe',
  }),
})

const step2Schema = z.object({
  address: z.string().min(5, 'Address is required').meta({
    label: 'Address (text input, required)',
    placeholder: 'Enter your street address',
  }),
  gender: z.enum(['male', 'female', 'other']).optional().meta({
    label: 'Gender (enum/select, optional)',
    placeholder: 'Select your gender',
  }),
})

const initialData = {
  address: '123 Main St',
  age: 30,
  agree: true,
  color: 'blue',
  description: 'This is a long description that exceeds 100 characters. '.repeat(3),
  disabledField: 'Cannot change this',
  email: 'john@example.com',
  name: 'John Doe',
  nickname: 'Johnny',
  readonlyField: 'Readonly Value',
  subscribe: true,
}

export function Form() {
  const schemas = useMemo(() => [step1Schema, step2Schema], [])
  const onSubmit = (data: z.infer<typeof step1Schema | typeof step2Schema>) => {
    logger.showInfo('onSubmit', data)
  }

  return <AutoForm initialData={initialData} onSubmit={onSubmit} schemas={schemas} />
}
