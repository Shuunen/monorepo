import { AutoForm, DebugData, mockSubmit, Title } from "@monorepo/components";
import { createFileRoute } from "@tanstack/react-router";
import { machine } from "../business/book-appointment/machine";
import type { Input } from "../business/book-appointment/machine.types";
import { useMachineSchemas } from "../utils/xstate.utils";

const cases = [
  {
    input: {},
    label: "Case A: Empty input",
  },
  {
    input: { formData: { breed: "dog" as const } },
    label: "Case B: Dog breed selected",
  },
  {
    input: { formData: { breed: "dog" as const, onDiet: true } },
    label: "Case C: Dog breed selected on diet",
  },
  {
    input: { formData: { breed: "cat" as const, onDiet: false } },
    label: "Case D: Cat breed selected not on diet",
  },
  {
    input: { formData: { breed: "dog" as const, dietFrequency: "daily" as const, onDiet: true } },
    label: "Case E: Dog breed selected on diet with diet frequency",
  },
  {
    input: {
      formData: {
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
      },
    },
    label: "Case F: Completely filled",
  },
] satisfies { input: Input; label: string }[];

function Form({ input }: { input: Input }) {
  const schemas = useMachineSchemas(machine, input);
  const onSubmit = () => mockSubmit("success", "Appointment booked successfully!");
  return (
    <div className="flex flex-col gap-4">
      {schemas.length > 0 && (
        <AutoForm
          initialData={input.formData}
          onSubmit={onSubmit}
          schemas={schemas}
          showLastStep
          showMenu={true}
          useSubmissionStep
          useSummaryStep
        />
      )}
      <DebugData data={input} isGhost title="Input" />
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
          <Form input={example.input} />
        </div>
      ))}
    </div>
  );
}

export const Route = createFileRoute("/book-appointment")({
  component: RouteComponent,
});
