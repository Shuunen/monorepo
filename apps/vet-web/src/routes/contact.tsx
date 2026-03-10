import { AutoForm, mockSubmit } from "@monorepo/components";
import { createFileRoute } from "@tanstack/react-router";
import { formSchema } from "../business/contact.schemas";

const contactSchemas = [formSchema];

function Contact() {
  return (
    <AutoForm
      onSubmit={() => mockSubmit("success", "Message sent successfully!")}
      schemas={contactSchemas}
      useSubmissionStep
    />
  );
}

export const Route = createFileRoute("/contact")({
  component: Contact,
});
