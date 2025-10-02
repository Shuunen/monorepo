// oxlint-disable no-magic-numbers
import { useMemo } from 'react'
import { z } from 'zod'
import { AutoForm } from '../../components/molecules/auto-form'
import { logger } from '../../utils/logger.utils'

const step1Schema = z.object({
  email: z.string().email('Invalid email address').meta({
    label: 'Email Address',
    placeholder: "We'll never share your email",
  }),
  name: z.string().min(2, 'Name is required').meta({
    label: 'Full Name',
    placeholder: 'Enter your legal name',
  }),
})

const step2Schema = z.object({
  address: z.string().min(5, 'Address is required').meta({
    label: 'Address',
    placeholder: 'Enter your street address',
  }),
  gender: z.enum(['male', 'female', 'other']).optional().meta({
    label: 'Gender',
    placeholder: 'Select your gender',
  }),
})

export function Form() {
  const schemas = useMemo(() => [step1Schema, step2Schema], [])
  const initialData = useMemo(() => ({ email: 'john@example.com', name: '' }), [])
  const onSubmit = (data: z.infer<typeof step1Schema | typeof step2Schema>) => {
    logger.showInfo('onSubmit', data)
  }

  return <AutoForm initialData={initialData} onSubmit={onSubmit} schemas={schemas} />
}
