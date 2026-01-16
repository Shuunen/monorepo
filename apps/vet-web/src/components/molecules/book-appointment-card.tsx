// oxlint-disable-next-line no-restricted-imports
import { BoxIcon, Calendar, Clock, PawPrint } from "lucide-react";
import { BookCard } from "./book-card";

export function BookAppointmentCard() {
  return (
    <BookCard
      buttonText="Book Now"
      buttonTo="/book-appointment"
      description="Schedule a visit with our veterinary specialists"
      features={[
        {
          heading: "Quick and Easy Scheduling",
          icon: <Clock className="mt-0.5 mr-3 size-5 text-primary" />,
          text: "Book appointments in just a few clicks",
        },
        {
          heading: "Specialized Care",
          icon: <PawPrint className="mt-0.5 mr-3 size-5 text-primary" />,
          text: "Our veterinarians are experts in pet healthcare",
        },
        {
          heading: "Comprehensive Services",
          icon: <BoxIcon className="mt-0.5 mr-3 size-5 text-primary" />,
          text: "From routine check-ups to emergency care",
        },
      ]}
      icon={<Calendar className="mr-2 size-7" />}
      title="Book an Appointment"
    />
  );
}
