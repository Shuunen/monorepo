// oxlint-disable no-magic-numbers
import { AutoForm } from '@monorepo/components'
import { useMemo } from 'react'
import { z } from 'zod'
import { logger } from '../../utils/logger.utils'

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

const initialData = {
  age: 30,
  email: 'john@example.com',
  name: 'John Doe',
  subscribe: true,
}

export function Form() {
  const schemas = useMemo(() => [step1Schema, step2Schema], [])
  const onSubmit = (data: z.infer<typeof step1Schema | typeof step2Schema>) => {
    logger.showInfo('onSubmit', data)
  }

  return <AutoForm initialData={initialData} onSubmit={onSubmit} schemas={schemas} />
}
