import { AutoForm, DebugData, mockSubmit, Title } from "@monorepo/components";
import { createFileRoute } from "@tanstack/react-router";
import { type FormData, machine } from "../business/book-appointment/machine";
import { useMachineSchemas } from "../utils/xstate.utils";

const cases = [
  {
    data: {},
    label: "Case A: Empty input",
  },
  {
    data: { breed: "dog" as const },
    label: "Case B: Dog breed selected",
  },
  {
    data: { breed: "dog" as const, onDiet: true },
    label: "Case C: Dog breed selected on diet",
  },
  {
    data: { breed: "cat" as const, onDiet: false },
    label: "Case D: Cat breed selected not on diet",
  },
  {
    data: { breed: "dog" as const, dietFrequency: "daily" as const, onDiet: true },
    label: "Case E: Dog breed selected on diet with diet frequency",
  },
  {
    data: {
      age: "FROM-5-TO-10",
      allergiesDocument: new File(["allergies-foobar-content"], "allergies.pdf", { type: "application/pdf" }),
      breed: "dog" as const,
      dietFrequency: "daily" as const,
      exerciseRoutine: "daily walks",
      identifier: "FR1234",
      isAllergicToPeanuts: true,
      isAllergicToSeafood: false,
      isVegan: false,
      name: "Buddy",
      onDiet: true,
    } satisfies FormData,
    label: "Case F: Completely filled",
  },
] as const;

function Form({ initialData }: { initialData: FormData }) {
  const schemas = useMachineSchemas(machine, initialData);
  const onSubmit = () => mockSubmit("success", "Appointment booked successfully!");
  return (
    <div className="flex flex-col gap-4">
      {schemas.length > 0 && <AutoForm initialData={initialData} onSubmit={onSubmit} schemas={schemas} showLastStep showMenu={true} useSubmissionStep useSummaryStep />}
      <DebugData data={initialData} isGhost title="Initial data" />
    </div>
  );
}

function RouteComponent() {
  return (
    <div className="flex flex-col gap-8">
      <Title className="text-center" variant="primary">
        Book an appointment with Dr. Nicolas JohnRom
      </Title>
      {Object.values(cases).map(example => (
        <div className="mb-6 grid gap-4" key={example.label}>
          <Title level={2}>{example.label}</Title>
          <Form initialData={example.data} />
        </div>
      ))}
    </div>
  );
}

export const Route = createFileRoute("/book-appointment")({
  component: RouteComponent,
});
