import { isBrowserEnvironment, Logger, sleep, stringify } from "@monorepo/utils";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { z } from "zod";
import { IconCheck } from "../icons/icon-check";
import { IconDownload } from "../icons/icon-download";
import { AutoForm } from "./auto-form";
import { field, forms, step } from "./auto-form.utils";
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

/**
 * Basic usage
 */
export const Basic: Story = {
  args: {
    schemas: [
      step(
        z.object({
          applicants: forms(applicantSchema, {
            icon: <IconCheck />,
            identifier: data => `${data.name} (${data.age} years)`,
            label: "Add persons",
            placeholder: "You can add multiple persons, no minimum or maximum.",
          }),
        }),
      ),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const formData = canvas.getByTestId("debug-data-form-data");
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    const addButton = canvas.getByTestId("button-add");

    await step("verify initial state", async () => {
      expect(formData).toContainHTML(`"applicants": []`);
      expect(submittedData).toContainHTML(`{}`);
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
      expect(formData).toContainHTML(`"applicants": []`);
      expect(submittedData).toContainHTML(`"applicants": []`);
    });

    await step("add first item", async () => {
      expect(canvas.queryByTestId("button-complete")).toBeNull();
      await userEvent.click(addButton);
      const completeButton = canvas.getByTestId("button-complete");
      expect(completeButton).toBeInTheDocument();
      await userEvent.click(completeButton);
      const nameInput = canvas.getByTestId("input-text-name");
      const ageInput = canvas.getByTestId("input-number-age");
      await userEvent.type(nameInput, "Alice");
      await userEvent.type(ageInput, "7");
      expect(submittedData).toContainHTML(`"applicants": []`);
      const subFormSubmitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(subFormSubmitButton);
      await sleep(100); // wait for state update
      // biome-ignore assist/source/useSortedKeys: order needed
      const expectedData = { applicants: [{ name: "Alice", age: 7 }] };
      expect(formData).toContainHTML(stringify(expectedData, true));
      expect(submittedData).toContainHTML(`"applicants": []`);
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
      expect(submittedData).toContainHTML(stringify(expectedData, true));
    });
  },
};

/**
 * With existing data
 */
export const ExistingData: Story = {
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
          applicants: forms(applicantSchema, {
            icon: <IconCheck />,
            identifier: data => `${data.name} (${data.age} years)`,
            label: "Fill in the applicants",
            maxItems: 5,
            minItems: 1,
            placeholder: "Please add at least one applicant, you can add up to 5.",
          }),
        }),
      ),
    ],
  },
};

/**
 * Basic boolean field with switch
 */
export const MultiStep: Story = {
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
          email: field(z.email().optional(), {
            label: "Email",
            placeholder: "Enter your email",
          }),
        }),
      ),
      step(
        z.object({
          applicants: forms(applicantSchema, {
            icon: <IconDownload className="text-blue-500" />,
            identifier: data => `${data.name} (${data.age} years)`,
            label: "Fill in the applicants",
            placeholder: "You can add multiple applicants, no minimum or maximum.",
          }),
        }),
      ),
    ],
  },
};
