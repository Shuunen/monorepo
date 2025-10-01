import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@monorepo/components'
import { Link } from '@tanstack/react-router'
import { Calendar, Clock, PawPrint } from 'lucide-react'

export function BookAppointmentCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center text-xl text-primary">
            <Calendar className="mr-2 h-6 w-6" />
            Book an Appointment
          </div>
        </CardTitle>
        <CardDescription>Schedule a visit with our veterinary specialists</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start">
            <Clock className="h-5 w-5 text-primary mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium">Quick and Easy Scheduling</h3>
              <p className="text-gray-600">Book appointments in just a few clicks</p>
            </div>
          </div>
          <div className="flex items-start">
            <PawPrint className="h-5 w-5 text-primary mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium">Specialized Care</h3>
              <p className="text-gray-600">Our veterinarians are experts in pet healthcare</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center pb-6 pt-2">
        <Link to="/book-appointment/step-1">
          <Button testId="book-now" variant="default">
            Book Now
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
