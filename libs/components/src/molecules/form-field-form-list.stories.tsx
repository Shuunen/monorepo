import { isBrowserEnvironment, Logger } from "@monorepo/utils";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { z } from "zod";
import { AutoForm } from "./auto-form";
import { field, step } from "./auto-form.utils";
import { DebugData } from "./debug-data";

const logger = new Logger({ minimumLevel: isBrowserEnvironment() ? "3-info" : "5-warn" });

const meta = {
  component: AutoForm,
  parameters: {
    layout: "centered",
  },
  render: args => {
    type FormData = Record<string, unknown> | undefined;
    const [formData, setFormData] = useState<Partial<FormData>>({});
    function onChange(data: Partial<FormData>) {
      setFormData(data);
      logger.info("Form data changed", data);
    }
    const [submittedData, setSubmittedData] = useState<FormData>({});
    function onSubmit(data: FormData) {
      setSubmittedData(data);
      logger.showSuccess("Form submitted successfully");
    }
    return (
      <div className="grid gap-4 mt-6 w-lg">
        <DebugData data={formData} isGhost title="Form data" />
        <AutoForm {...args} logger={logger} onChange={onChange} onSubmit={onSubmit} />
        <DebugData data={submittedData} isGhost title="Submitted data" />
      </div>
    );
  },
  tags: ["autodocs"],
  title: "Commons/Molecules/FormFieldFormList",
} satisfies Meta<typeof AutoForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// biome-ignore assist/source/useSortedKeys: it's ok dude :p
const applicantSchema = z.object({
  name: field(z.string().min(2), {
    label: "Child's Name",
    placeholder: "Enter the name of the child",
  }),
  age: field(z.number().min(0).max(120), {
    label: "Child's Age",
    placeholder: "Enter the age of the child",
  }),
});

/*
// To be implemented
const applicantStep = formListStep(applicantSchema, {
  identifier: (data) => `${data.name} (${data.age} years)`,
});
*/

/**
 * Basic boolean field with switch
 */
export const Basic: Story = {
  args: {
    initialData: {
      applicants: [
        { age: 7, name: "Alice" },
        { age: 9, name: "Bob" },
      ],
    },
    schemas: [
      step(
        z.object({
          // applicants: field(z.array(applicantStep), { // To be implemented
          applicants: field(z.array(applicantSchema), {
            label: "Fill in the applicants",
            render: "form-list",
          }),
        }),
      ),
    ],
  },
};
