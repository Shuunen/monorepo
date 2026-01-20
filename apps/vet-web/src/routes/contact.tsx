import { AutoForm, mockSubmit } from "@monorepo/components";
import { formSchema } from "../business/contact.schemas";

export default function Contact() {
  return (
    <AutoForm
      onSubmit={() => mockSubmit("success", "Message sent successfully!")}
      schemas={[formSchema]}
      useSubmissionStep
    />
  );
}
