/** biome-ignore-all assist/source/useSortedKeys: it's ok in schemas */
import { nbThird } from '@monorepo/utils'
import { z } from 'zod'
import { ageInput } from '../../utils/age.utils'

export const step1Schema = z.object({
  email: z.email('Invalid email address').meta({
    label: 'Email Address',
    placeholder: "We'll never share your email",
  }),
  name: z.string().min(nbThird, 'Name is required').meta({
    label: 'Full Name',
    placeholder: 'Enter your legal name',
  }),
})

export const step2Schema = z.object({
  age: ageInput,
  subscribe: z.boolean().optional().meta({
    label: 'Subscribe to newsletter',
    placeholder: 'Check to subscribe',
  }),
})
