import { Button } from '@monorepo/components'
import { cn, Result } from '@monorepo/utils'
import { Link } from '@tanstack/react-router'
// oxlint-disable-next-line no-restricted-imports
import { CatIcon, CheckCircleIcon, CircleIcon, DogIcon } from 'lucide-react'
import { bookingSteps } from './-steps.const'
import { useBookAppointmentStore } from './-steps.store'
import { baseDataSchema, catComplementaryDataSchema, dogComplementaryDataSchema, hasAccess } from './-steps.utils'

export function Stepper() {
  const { currentStep, data } = useBookAppointmentStore()
  const variant = data.baseData.breed
  const { success: baseValid } = baseDataSchema.safeParse(data.baseData)
  const { success: complementaryValid } = data.baseData.breed === 'cat' ? catComplementaryDataSchema.safeParse(data.complementaryData) : dogComplementaryDataSchema.safeParse(data.complementaryData)

  const steps = [
    {
      completed: baseValid,
      path: '/book-appointment/step-1',
    },
    {
      completed: complementaryValid && baseValid,
      disabled: Result.unwrap(hasAccess(1, variant, data)).error !== undefined,
      path: `/book-appointment/${variant}/step-2`,
    },
    {
      completed: complementaryValid && baseValid,
      // eslint-disable-next-line no-magic-numbers
      disabled: Result.unwrap(hasAccess(2, variant, data)).error !== undefined,
      path: '/book-appointment/step-3',
    },
  ]

  return (
    <div className="flex flex-col gap-6 border-r border-gray-200 pr-12 mr-12" data-testid="stepper">
      {steps.map((step, index) => (
        <Link disabled={step.disabled} key={step.path} preload="intent" to={step.path}>
          <Button className={cn('flex-1 h-full justify-start pl-0 hover:bg-transparent', step.disabled && 'opacity-50 cursor-not-allowed')} disabled={step.disabled} size="sm" testId="stepper" variant="link">
            <div className="flex">
              {step.completed ? <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" /> : <CircleIcon className="w-5 h-5 text-gray-400 mr-2" />}
              <span className={cn(currentStep === index ? 'font-medium' : 'font-normal')}>{bookingSteps[index].step}</span>
            </div>
          </Button>
        </Link>
      ))}
      <div className="mx-auto opacity-10 size-1/2">{data.baseData.breed === 'cat' ? <CatIcon className="size-full text-orange-700" /> : <DogIcon className="size-full text-green-700" />}</div>
    </div>
  )
}
