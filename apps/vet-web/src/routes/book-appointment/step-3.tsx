import { Button } from '@monorepo/components'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeftIcon, Calendar1Icon } from 'lucide-react'
import { useEffect } from 'react'
import { logger } from '../../utils/logger.utils'
import { useBookAppointmentStore } from './-steps.store'
import { hasAccess } from './-steps.utils'

function SummaryPage() {
  const navigate = useNavigate()
  const { data, setCurrentStep } = useBookAppointmentStore()
  const variant = data.baseData.breed

  useEffect(() => {
    const step = 2
    const check = hasAccess(step, variant, data)
    if (!check.ok) navigate({ to: `/book-appointment/${variant}/step-2` })
    setCurrentStep(step)
  }, [variant, data, navigate, setCurrentStep])

  async function onBook() {
    logger.showSuccess('Appointment booked successfully!')
    await navigate({ params: { status: 'success', type: 'appointment' }, to: '/status/$status/$type' })
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="col-span-2 font-bold text-xl">Base data</h3>
      {Object.entries(data.baseData).map(([key, value]) => (
        <div className="grid grid-cols-2" key={key}>
          <div className="text-gray-500">{key}</div>
          <div>{JSON.stringify(value)}</div>
        </div>
      ))}

      <h3 className="col-span-2 font-bold text-xl">Complementary data</h3>
      {Object.entries(data.complementaryData).map(([key, value]) => (
        <div className="grid grid-cols-2" key={key}>
          <div className="text-gray-500">{key}</div>
          <div>{value instanceof File ? value.name : value}</div>
        </div>
      ))}

      <div className="flex gap-18 mt-6">
        <Link to={`/book-appointment/${data.baseData.breed}/step-2`}>
          <Button testId="back" type="button" variant="link">
            <ArrowLeftIcon /> Back
          </Button>
        </Link>
        <Button onClick={onBook} testId="book" type="button">
          Book that appointment <Calendar1Icon />
        </Button>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/book-appointment/step-3')({
  component: SummaryPage,
})
