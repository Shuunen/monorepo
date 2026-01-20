import { BookAppointmentCard } from "../components/molecules/book-appointment-card";
import { BookCleaningCard } from "../components/molecules/book-cleaning-card";

export default function Index() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col items-center justify-center mb-12">
        <h1 className="text-4xl font-bold text-center text-primary">
          Medical Interface for Lovable Furballs
        </h1>
        <p className="mt-4 text-xl text-gray-600 text-center max-w-2xl">
          Providing the best care for your furry friends with our dedicated
          veterinary services
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <BookAppointmentCard />
        <BookCleaningCard />
      </div>

      <div className="mt-16 text-center text-gray-500">
        <p>Need assistance? Contact our clinic at (555) 123-4567</p>
      </div>
    </div>
  );
}
