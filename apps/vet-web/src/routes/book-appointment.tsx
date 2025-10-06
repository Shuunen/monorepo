import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, DebugData } from '@monorepo/components'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Stepper } from './book-appointment/-stepper'
import { bookingSteps } from './book-appointment/-steps.const'
import { useBookAppointmentStore } from './book-appointment/-steps.store'

function RouteComponent() {
  const { currentStep, data } = useBookAppointmentStore()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold text-primary my-4 text-center" data-testid="title">
        Book an appointment with Dr. Nicolas Johnrom
      </h1>
      <div className="flex mt-4">
        <Stepper />
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{bookingSteps[currentStep].title}</CardTitle>
            <CardDescription>{bookingSteps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Outlet />
          </CardContent>
          <CardFooter />
        </Card>
      </div>
      <DebugData className="mt-4" data={data} />
    </div>
  )
}

export const Route = createFileRoute('/book-appointment')({
  component: RouteComponent,
})
