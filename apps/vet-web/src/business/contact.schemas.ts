import { field, section } from '@monorepo/components'
import { z } from 'zod'

export const formSchema = z.object({
  title: section({
    title: 'Contact Us',
    description: 'Feel free to reach out to us with any questions or concerns.',
    line: true,
  }),
  message: field(z.string().min(1), { label: 'Your Message' }),
  phone: field(z.string().optional(), { label: 'Your Phone Number' }),
})
