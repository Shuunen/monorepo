import { AutoForm, mockSubmit } from "@monorepo/components";
import { createFileRoute } from "@tanstack/react-router";
import { formSchema } from "../business/contact.schemas";

function Contact() {
  return <AutoForm onSubmit={() => mockSubmit("success", "Message sent successfully!")} schemas={[formSchema]} useSubmissionStep />;
}

export const Route = createFileRoute("/contact")({
  component: Contact,
});
