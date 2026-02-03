import { createFileRoute } from "@tanstack/react-router";
import { BookAppointmentCard } from "../components/molecules/book-appointment-card";
import { BookCleaningCard } from "../components/molecules/book-cleaning-card";

function Index() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 flex flex-col items-center justify-center">
        <h1 className="text-center text-4xl font-bold text-primary">Medical Interface for Lovable Furballs</h1>
        <p className="mt-4 max-w-2xl text-center text-xl text-gray-600">
          Providing the best care for your furry friends with our dedicated veterinary services
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <BookAppointmentCard />
        <BookCleaningCard />
      </div>

      <div className="mt-16 text-center text-gray-500">
        <p>Need assistance? Contact our clinic at (555) 123-4567</p>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: Index,
});
