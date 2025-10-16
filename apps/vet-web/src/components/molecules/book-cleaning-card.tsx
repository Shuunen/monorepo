// oxlint-disable-next-line no-restricted-imports
import { Brush, CalendarCheck2, Sparkles } from 'lucide-react'
import { BookCard } from './book-card'

export function BookCleaningCard() {
  return (
    <BookCard
      buttonText="Book Cleaning"
      buttonTo="/book-cleaning"
      description="Schedule a professional cleaning service for your space"
      features={[
        {
          heading: 'Flexible Scheduling',
          icon: <CalendarCheck2 className="size-5 text-primary mr-3 mt-0.5" />,
          text: 'Choose a time that works best for you',
        },
        {
          heading: 'Thorough & Reliable',
          icon: <Brush className="size-5 text-primary mr-3 mt-0.5" />,
          text: 'Experienced cleaners ensure spotless results',
        },
        {
          heading: 'Eco-Friendly Products',
          icon: <Sparkles className="size-5 text-primary mr-3 mt-0.5" />,
          text: 'Safe for your family and the environment',
        },
      ]}
      icon={<Brush className="mr-2 size-7" />}
      title="Book a Cleaning"
    />
  )
}
