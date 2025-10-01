import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@monorepo/components'
import { createFileRoute, Link } from '@tanstack/react-router'
import { AlertCircle, CheckCircle, Home, Info } from 'lucide-react'

const statusIcons = {
  error: <AlertCircle className="h-16 w-16 text-red-500" />,
  success: <CheckCircle className="h-16 w-16 text-green-500" />,
  warning: <Info className="h-16 w-16 text-amber-500" />,
} as const

type Statuses = 'error' | 'success' | 'warning'

const defaultMessages = {
  error: {
    description: 'We encountered a problem with your request.',
    details: 'Please try again or contact our support team for assistance.',
    title: 'Error',
  },
  success: {
    description: 'Your request was completed successfully.',
    details: 'Thank you for using Medical Interface for Lovable Furballs.',
    title: 'Success',
  },
  warning: {
    description: 'Your request was processed with some concerns.',
    details: 'Please review the details and contact us if you need further clarification.',
    title: 'Warning',
  },
} satisfies Record<Statuses, { title: string; description: string; details: string }>

const typeMessages = {
  appointment: {
    error: {
      description: 'We could not schedule your appointment at this time.',
      details: 'Please try again or contact our clinic directly at (555) 123-4567.',
      title: 'Appointment Scheduling Failed',
    },
    success: {
      description: 'Your veterinary appointment has been confirmed.',
      details: 'You will receive a confirmation email with all the details shortly. Thank you for choosing Medical Interface for Lovable Furballs.',
      title: 'Appointment Scheduled',
    },
  },
} satisfies Record<string, Partial<typeof defaultMessages>> as Record<string, Partial<typeof defaultMessages>>

function StatusTypePage() {
  // eslint-disable-next-line no-use-before-define
  const params = Route.useParams()
  const status = params.status as keyof typeof statusIcons
  const type = params.type as keyof typeof typeMessages | undefined
  const statusIcon = statusIcons[status]
  const typeMessage = type && type in typeMessages ? typeMessages[type] : defaultMessages
  const message = typeMessage[status] ?? defaultMessages[status]

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">{statusIcon}</div>
            <CardTitle className="flex justify-center text-2xl">{message.title}</CardTitle>
            <CardDescription>{message.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">{message.details}</p>
          </CardContent>
          <CardFooter className="flex justify-center gap-4 pb-6 pt-2">
            <Button asChild testId="return-home">
              <Link to="/">
                <Home className="mr-2 size-4" />
                Return Home
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/status/$status/$type')({
  component: StatusTypePage,
})
