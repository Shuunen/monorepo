import { BoxIcon, Calendar, Clock, PawPrint } from 'lucide-react'
import { BookCard } from './book-card'

export function BookAppointmentCard() {
  return (
    <BookCard
      buttonText="Book Now"
      buttonTo="/book-appointment/step-1"
      description="Schedule a visit with our veterinary specialists"
      features={[
        {
          heading: 'Quick and Easy Scheduling',
          icon: <Clock className="size-5 text-primary mr-3 mt-0.5" />,
          text: 'Book appointments in just a few clicks',
        },
        {
          heading: 'Specialized Care',
          icon: <PawPrint className="size-5 text-primary mr-3 mt-0.5" />,
          text: 'Our veterinarians are experts in pet healthcare',
        },
        {
          heading: 'Comprehensive Services',
          icon: <BoxIcon className="size-5 text-primary mr-3 mt-0.5" />,
          text: 'From routine check-ups to emergency care',
        },
      ]}
      icon={<Calendar className="mr-2 size-7" />}
      title="Book an Appointment"
    />
  )
}
