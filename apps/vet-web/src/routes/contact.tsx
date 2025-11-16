import { AutoForm, mockSubmit, Title } from '@monorepo/components'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const formSchema = z.object({
  message: z.string().min(1).meta({ label: 'Your Message' }),
  phone: z.string().optional().meta({ label: 'Your Phone Number' }),
})

function Contact() {
  function onSubmit() {
    return mockSubmit('success', 'Message sent successfully!')
  }
  return (
    <div className="flex flex-col gap-4">
      <Title variant="primary">Contact Us</Title>
      <AutoForm onSubmit={onSubmit} schemas={[formSchema]} useSubmissionStep />
    </div>
  )
}

export const Route = createFileRoute('/contact')({
  component: Contact,
})
