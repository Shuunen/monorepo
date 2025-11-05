import { AutoForm, mockSubmit, Title } from '@monorepo/components'
import { createFileRoute } from '@tanstack/react-router'
import { step1Schema, step2Schema } from './book-appointment.schemas'

function RouteComponent() {
  const onSubmit = () => mockSubmit('success', 'Appointment booked successfully!')
  return (
    <div className="flex flex-col gap-4">
      <Title className="text-center" variant="primary">
        Book an appointment with Dr. Nicolas Johnrom
      </Title>
      <AutoForm onSubmit={onSubmit} schemas={[step1Schema, step2Schema]} useSubmissionStep useSummaryStep />
    </div>
  )
}

export const Route = createFileRoute('/book-appointment')({
  component: RouteComponent,
})
