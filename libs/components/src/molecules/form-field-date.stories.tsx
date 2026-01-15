import { isBrowserEnvironment, Logger, stringify } from "@monorepo/utils";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { z } from "zod";
import { AutoForm } from "./auto-form";
import { field } from "./auto-form.utils";
import { DebugData } from "./debug-data";

const logger = new Logger({ minimumLevel: isBrowserEnvironment() ? "3-info" : "5-warn" });

const meta = {
  component: AutoForm,
  parameters: {
    layout: "centered",
  },
  render: args => {
    type FormData = Record<string, unknown> | undefined;
    const [submittedData, setSubmittedData] = useState<FormData>({});
    function onSubmit(data: FormData) {
      setSubmittedData(data);
      logger.showSuccess("Form submitted successfully");
    }
    return (
      <div className="grid gap-4 mt-6 w-lg">
        <AutoForm {...args} logger={logger} onSubmit={onSubmit} />
        <DebugData data={submittedData} isGhost title="Submitted data" />
      </div>
    );
  },
  tags: ["autodocs"],
  title: "Commons/Molecules/FormFieldDate",
} satisfies Meta<typeof AutoForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic date field with z.date() output (E2E: fill, submit, verify Date object)
 */
export const Basic: Story = {
  args: {
    schemas: [
      z.object({
        birthDate: field(z.date(), {
          label: "Birth Date",
          placeholder: "Select your birth date",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const dateInput = canvas.getByTestId("input-date-birth-date") as HTMLInputElement;
    expect(dateInput).toBeInTheDocument();
    expect(dateInput).toHaveAttribute("type", "date");
    await step("fill date input", async () => {
      await userEvent.clear(dateInput);
      await userEvent.type(dateInput, "1990-05-15");
      expect(dateInput).toHaveValue("1990-05-15");
    });
    await step("submit form", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify submitted data contains Date object", () => {
      const submittedData = canvas.getByTestId("debug-data-submitted-data");
      const expectedDate = new Date("1990-05-15");
      expect(submittedData).toContainHTML(stringify({ birthDate: expectedDate }, true));
    });
  },
};

/**
 * Date field with initial value (Date object input, E2E: verify initial display, form data tracking, and submit)
 */
export const WithInitialValue: Story = {
  args: {
    initialData: { eventDate: new Date("2025-12-25") },
    schemas: [
      z.object({
        eventDate: field(z.date(), {
          label: "Event Date",
          placeholder: "Select event date",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const dateInput = canvas.getByTestId("input-date-event-date") as HTMLInputElement;
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    await step("verify initial value is displayed", () => {
      expect(dateInput).toHaveValue("2025-12-25");
    });
    await step("submit form with initial value", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify submitted data matches initial Date", () => {
      expect(submittedData).toContainHTML(stringify({ eventDate: new Date("2025-12-25") }, true));
    });
  },
};

/**
 * Optional date field
 */
export const Optional: Story = {
  args: {
    schemas: [
      z.object({
        reminderDate: field(z.date().optional(), {
          label: "Reminder Date",
          placeholder: "Set a reminder date",
        }),
      }),
    ],
  },
};

/**
 * Disabled date field
 */
export const Disabled: Story = {
  args: {
    initialData: { lockDate: new Date("2025-01-01") },
    schemas: [
      z.object({
        lockDate: field(z.date(), {
          label: "Locked Date",
          placeholder: "This date is locked",
          state: "disabled",
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dateInput = canvas.getByTestId("input-date-lock-date") as HTMLInputElement;
    expect(dateInput).toBeDisabled();
    expect(dateInput).toHaveValue("2025-01-01");
  },
};

/**
 * Readonly date field
 */
export const Readonly: Story = {
  args: {
    initialData: { createdDate: new Date("2024-01-15") },
    schemas: [
      z.object({
        createdDate: field(z.date(), {
          label: "Created Date",
          placeholder: "Creation date (readonly)",
          state: "readonly",
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dateInput = canvas.getByTestId("input-date-created-date") as HTMLInputElement;
    expect(dateInput).toHaveAttribute("readonly");
    expect(dateInput).toHaveValue("2024-01-15");
  },
};

/**
 * String date field using render metadata (E2E: fill, submit, verify ISO string output)
 */
export const StringDateWithRender: Story = {
  args: {
    schemas: [
      z.object({
        stringDate: field(z.string(), {
          label: "String Date Field",
          placeholder: "Select a date (string)",
          render: "date",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const dateInput = canvas.getByTestId("input-date-string-date") as HTMLInputElement;
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    expect(dateInput).toBeInTheDocument();
    expect(dateInput).toHaveAttribute("type", "date");
    await step("fill date input", async () => {
      await userEvent.clear(dateInput);
      await userEvent.type(dateInput, "2023-03-20");
      expect(dateInput).toHaveValue("2023-03-20");
    });
    await step("submit form", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify submitted data contains ISO string", () => {
      expect(submittedData).toContainHTML(stringify({ stringDate: "2023-03-20" }, true));
    });
  },
};
