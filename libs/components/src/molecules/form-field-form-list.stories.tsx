import { isBrowserEnvironment, Logger, sleep, stringify } from "@monorepo/utils";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { z } from "zod";
import { IconCheck } from "../icons/icon-check";
import { IconDownload } from "../icons/icon-download";
import { IconHome } from "../icons/icon-home";
import { AutoForm } from "./auto-form";
import type { AutoFormData } from "./auto-form.types";
import { field, forms, step } from "./auto-form.utils";
import { DebugData } from "./debug-data";

const logger = new Logger({ minimumLevel: isBrowserEnvironment() ? "3-info" : "5-warn" });

const meta = {
  component: AutoForm,
  parameters: {
    layout: "centered",
  },
  render: args => {
    const [submittedData, setSubmittedData] = useState<AutoFormData>({});
    function onSubmit(data: AutoFormData) {
      setSubmittedData(data);
      logger.showSuccess("Form submitted successfully");
    }
    return (
      <div className="mt-6 grid w-lg gap-4">
        <AutoForm {...args} logger={logger} onSubmit={onSubmit} />
        <DebugData data={submittedData} isGhost title="Submitted data" />
      </div>
    );
  },
  tags: ["autodocs"],
  title: "Commons/Molecules/FormFieldFormList",
} satisfies Meta<typeof AutoForm>;

export default meta;
type Story = StoryObj<typeof meta>;

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
          persons: forms(applicantSchema, {
            icon: <IconHome />,
            identifier: data => (data ? `${data.name} (${data.age} years)` : "New person"),
            label: "Add persons",
            labels: {
              addButton: "Add person",
              completeButton: "Edit person details",
            },
            placeholder: "You can add multiple persons, no minimum or maximum.",
          }),
        }),
      ),
    ],
  },
};

/**
 * Empty form list
 */
export const Empty: Story = {
  args: {
    schemas: [
      step(
        z.object({
          persons: forms(applicantSchema, {
            icon: <IconHome />,
            identifier: data => (data ? `${data.name} (${data.age} years)` : "New person"),
            label: "Add persons",
            placeholder: "You can add multiple persons, no minimum or maximum.",
          }),
        }),
      ),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const submittedData = canvas.getByTestId("debug-data-submitted-data");

    await step("verify initial state", async () => {
      expect(submittedData).toContainHTML(`{}`);
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
      expect(submittedData).toContainHTML(`{}`);
    });

    await step("add first item", async () => {
      expect(canvas.queryByTestId("button-complete")).toBeNull();
      const addButton = canvas.getByTestId("button-add");
      await userEvent.click(addButton);
      const completeButton = canvas.getByTestId("button-complete");
      expect(completeButton).toBeInTheDocument();
      await userEvent.click(completeButton);
      const nameInput = canvas.getByTestId("input-text-name");
      const ageInput = canvas.getByTestId("input-number-age");
      await userEvent.type(nameInput, "Alice");
      await userEvent.type(ageInput, "7");
      expect(submittedData).toContainHTML(`{}`);
      const subFormSubmitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(subFormSubmitButton);
      await sleep(100); // wait for state update
      const expectedData = { persons: [{ name: "Alice", age: 7 }] };
      expect(submittedData).toContainHTML(`{}`);
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
      const badgeSuccess = canvas.getByTestId("badge-status");
      expect(badgeSuccess).toHaveTextContent("Validated");
      expect(submittedData).toContainHTML(stringify(expectedData, true));
    });

    await step("remove first item", async () => {
      const removeButton = canvas.getByTestId("button-delete");
      expect(removeButton).toBeInTheDocument();
      await userEvent.click(removeButton);
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
      expect(submittedData).toContainHTML(`"persons": []`);
    });

    await step("add another item", async () => {
      const addButton = canvas.getByTestId("button-add");
      await userEvent.click(addButton);
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
      const badge = canvas.getByTestId("badge-status");
      expect(badge).toHaveTextContent("Incomplete");
    });
  },
};

/**
 * Required form list
 */
export const Required: Story = {
  args: {
    schemas: [
      step(
        z.object({
          persons: forms(applicantSchema, {
            icon: <IconHome />,
            identifier: data => (data ? `${data.name} (${data.age} years)` : "New person"),
            label: "Add persons",
            minItems: 1,
            placeholder: "You can add multiple persons, minimum is one.",
          }),
        }),
      ),
    ],
  },
};

const initialData = {
  applicants: [
    { name: "Alice", age: 7 },
    { name: "Bob", age: 9 },
  ],
};

/**
 * With existing data
 */
export const ExistingData: Story = {
  args: {
    initialData,
    schemas: [
      step(
        z.object({
          applicants: forms(applicantSchema, {
            icon: <IconCheck />,
            identifier: data => (data ? `${data.name} (${data.age} years)` : "New person"),
            label: "Fill in the applicants",
            maxItems: 5,
            minItems: 1,
            placeholder: "Please add at least one applicant, you can add up to 5.",
          }),
        }),
      ),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const submittedData = canvas.getByTestId("debug-data-submitted-data");

    await step("verify initial state", () => {
      expect(submittedData).toContainHTML(`{}`);
      const badgesSuccess = canvas.getAllByTestId("badge-status");
      expect(badgesSuccess.length).toBe(2);
      expect(badgesSuccess[0]).toHaveTextContent("Validated");
      expect(badgesSuccess[1]).toHaveTextContent("Validated");
    });

    await step("add a third item", async () => {
      const addButton = canvas.getByTestId("button-add");
      await userEvent.click(addButton);
      await sleep(100);
      const badges = canvas.getAllByTestId("badge-status");
      expect(badges.length).toBe(3);
      expect(badges[2]).toHaveTextContent("To complete");
    });

    await step("try to exceed max items", async () => {
      const addButton = canvas.getByTestId("button-add");
      expect(addButton).toBeInTheDocument();
      await userEvent.click(addButton);
      await sleep(100);
      await userEvent.click(addButton);
      await sleep(100);
      expect(addButton).toBeDisabled();
    });

    await step("try to go below min items", async () => {
      const deleteButtons = canvas.getAllByTestId("button-delete");
      expect(deleteButtons.length).toBe(5);
      await userEvent.click(deleteButtons[4]);
      await userEvent.click(deleteButtons[3]);
      await userEvent.click(deleteButtons[2]);
      await userEvent.click(deleteButtons[1]);
      await userEvent.click(deleteButtons[0]);
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
      const error = canvas.getByTestId("form-message-applicants");
      expect(error).toBeVisible();
      expect(error).toHaveTextContent("At least one item is required");
    });
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
            identifier: data => (data ? `${data.name} (${data.age} years)` : "New person"),
            label: "Fill in the applicants",
            placeholder: "You can add multiple applicants, no minimum or maximum.",
          }),
        }),
      ),
    ],
  },
};

export const FormListInitializedFixedEmpty: Story = {
  args: {
    schemas: [
      step(
        z.object({
          applicantReferences: forms(applicantSchema, {
            icon: <IconCheck />,
            identifier: data => (data ? `${data.name} (${data.age} years)` : "New person"),
            label: "Fill in the applicants",
            nbItems: 3,
          }),
        }),
      ),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const firstApplicant = canvas.getByTestId("applicantReferences-0");
    const secondApplicant = canvas.getByTestId("applicantReferences-1");
    const thirdApplicant = canvas.getByTestId("applicantReferences-2");
    expect(firstApplicant).toBeInTheDocument();
    expect(secondApplicant).toBeInTheDocument();
    expect(thirdApplicant).toBeInTheDocument();
  },
};
