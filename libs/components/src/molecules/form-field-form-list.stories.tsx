import { isBrowserEnvironment, Logger, sleep, stringify } from "@monorepo/utils";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { invariant } from "es-toolkit";
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
import { nbFilledItems } from "./form-field-form-list.utils";

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
    errors: (data?: AutoFormData) => {
      if (data?.name === "Bob") {
        return "Bob is not allowed as child name, please choose something nice.";
      }
      return undefined;
    },
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
            identifier: data => (data?.name ? `${data.name} (${data.age} years)` : `New person - ${data?.index}`),
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
            identifier: data => (data?.name ? `${data.name} (${data.age} years)` : `New person - ${data?.index}`),
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
            identifier: data => (data?.name ? `${data.name} (${data.age} years)` : `New person - ${data?.index}`),
            label: "Add persons",
            errors: (data?: AutoFormData) =>
              nbFilledItems(data?.persons) === 0 ? "At least one item is required" : undefined,
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
            identifier: data => (data?.name ? `${data.name} (${data.age} years)` : `New person - ${data?.index}`),
            label: "Fill in the applicants",
            maxItems: 5,
            errors: (data?: AutoFormData) =>
              nbFilledItems(data?.applicants) === 0 ? "At least one item is required" : undefined,
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
      invariant(deleteButtons[0], "Delete button 0 not found");
      invariant(deleteButtons[1], "Delete button 1 not found");
      invariant(deleteButtons[2], "Delete button 2 not found");
      invariant(deleteButtons[3], "Delete button 3 not found");
      invariant(deleteButtons[4], "Delete button 4 not found");
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

const applicantSchemaWithErrors = z.object({
  name: field(z.string().min(2), {
    label: "Child's Name",
    placeholder: "Enter the name of the child",
    errors: (data, parentData) => {
      if (data?.name === "Bob" && parentData?.parentName === "Bob") {
        return "Please do not name your child after you";
      }
      return undefined;
    },
  }),
  age: field(z.number().min(0).max(120), {
    label: "Child's Age",
    placeholder: "Enter the age of the child",
  }),
});

/**
 * Multi-step form list
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
          parentName: field(z.string().optional(), {
            label: "Parent Name",
            placeholder: "Enter the name of the parent",
          }),
          email: field(z.email().optional(), {
            label: "Email",
            placeholder: "Enter your email",
          }),
        }),
      ),
      step(
        z.object({
          applicants: forms(applicantSchemaWithErrors, {
            icon: <IconDownload className="text-blue-500" />,
            identifier: data => (data?.name ? `${data.name} (${data.age} years)` : `New person - ${data?.index}`),
            label: "Fill in the applicants",
            placeholder: "You can add multiple applicants, no minimum or maximum.",
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
    });
    await step("setup parent name and go next step", async () => {
      const parentNameInput = canvas.getByTestId("input-text-parent-name");
      await userEvent.type(parentNameInput, "Bob");
      const nextButton = canvas.getByRole("button", { name: "Next" });
      await userEvent.click(nextButton);
    });
    await step("click on bob and see errors only after submit", async () => {
      const allCompleteButtons = canvas.getAllByTestId("button-complete");
      expect(allCompleteButtons.length).toBe(2);
      invariant(allCompleteButtons[1], "Complete button 1 not found");
      await userEvent.click(allCompleteButtons[1]);
      const errorsBeforeSubmit = canvas.queryAllByRole("alert");
      expect(errorsBeforeSubmit).toHaveLength(0);
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
      const errors = canvas.getAllByRole("alert");
      expect(errors).toHaveLength(1);
      expect(errors[0]).toHaveTextContent("Please do not name your child after you");
    });
  },
};

export const FormListInitializedFixedEmpty: Story = {
  args: {
    schemas: [
      step(
        z.object({
          applicantReferences: forms(applicantSchema, {
            icon: <IconCheck />,
            identifier: data => (data?.name ? `${data.name} (${data.age} years)` : `New person - ${data?.index}`),
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

const applicantSchemaWithKeyMapping = z.object({
  name: field(z.string().min(2), {
    label: "Child's Name",
    placeholder: "Enter the name of the child",
    key: "childName",
  }),
  diet: field(z.string().min(2).prefault("vegan"), {
    label: "Child's diet",
    key: "additionalInformations.diet",
  }),
  age: field(z.number().min(0).max(120), {
    label: "Child's Age",
    placeholder: "Enter the age of the child",
  }),
});

export const WithKeyMapping: Story = {
  args: {
    schemas: [
      step(
        z.object({
          persons: forms(applicantSchemaWithKeyMapping, {
            icon: <IconHome />,
            identifier: data => (data?.name ? `${data.name} (${data.age} years)` : `New person - ${data?.index}`),
            label: "Add persons",
            placeholder: "You can add multiple persons, no minimum or maximum.",
            key: "applicants",
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
      const expectedData = { applicants: [{ childName: "Alice", additionalInformations: { diet: "vegan" }, age: 7 }] };
      expect(submittedData).toContainHTML(`{}`);
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
      const badgeSuccess = canvas.getByTestId("badge-status");
      expect(badgeSuccess).toHaveTextContent("Validated");
      expect(submittedData).toContainHTML(stringify(expectedData, true));
    });
  },
};
