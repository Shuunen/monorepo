import { AutoForm, DebugData, mockSubmit, Title } from "@monorepo/components";
import { useState } from "react";
import { step1Schema, step2Schema } from "../business/book-cleaning/schemas";

export default function BookCleaning() {
  const schemas = [step1Schema, step2Schema];
  const [submittedData, setSubmittedData] = useState<object>({});
  function onSubmit(data: object) {
    setSubmittedData(data);
    return mockSubmit("success", "Appointment booked successfully!");
  }

  return (
    <div className="flex flex-col gap-4">
      <Title className="text-center" variant="primary">
        Book a cleaning session with Mr Clean
      </Title>
      <AutoForm
        onSubmit={onSubmit}
        schemas={schemas}
        useSubmissionStep
        useSummaryStep
      />
      <DebugData data={submittedData} isGhost title="Submitted data" />
    </div>
  );
}
