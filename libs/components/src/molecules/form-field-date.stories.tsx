import { dateIso10, isBrowserEnvironment, Logger, stringify } from "@monorepo/utils";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { z } from "zod";
import { AutoForm } from "./auto-form";
import { field } from "./auto-form.utils";
import { DebugData } from "./debug-data";
import { dateTodayOrFutureSchema, today, tomorrow } from "./form-field-date.utils";

const logger = new Logger({ minimumLevel: isBrowserEnvironment() ? "3-info" : "5-warn" });

/** Converts ISO date "YYYY-MM-DD" to display format "DD/MM/YYYY" */
function isoToDisplay(isoDate: string): string {
  const [yyyy, mm, dd] = isoDate.split("-");
  return `${dd}/${mm}/${yyyy}`;
}

/** Converts ISO date "YYYY-MM-DD" to input format "DDMMYYYY" for masked input */
function isoToInput(isoDate: string): string {
  const [yyyy, mm, dd] = isoDate.split("-");
  return `${dd}${mm}${yyyy}`;
}

// expect a Date instance input and output a date string
const isoDateStringToDateInstance = z.codec(z.iso.date(), z.date(), {
  decode: isoDateString => new Date(isoDateString),
  encode: date => dateIso10(date),
});

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
      <div className="mt-6 grid w-lg gap-4">
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
    const dateInput = canvas.getByTestId("input-date-birth-date");
    expect(dateInput).toBeInTheDocument();
    await step("fill date input", async () => {
      await userEvent.clear(dateInput);
      await userEvent.type(dateInput, "15051990");
      expect(dateInput).toHaveValue("15/05/1990");
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
 * Basic date field with defaultToNoon option (E2E: fill, submit, verify Date object has noon UTC time)
 */
export const BasicDefaultToNoon: Story = {
  args: {
    schemas: [
      z.object({
        birthDate: field(z.date(), {
          defaultToNoon: true,
          label: "Birth Date (noon UTC)",
          placeholder: "Select your birth date",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const dateInput = canvas.getByTestId("input-date-birth-date");
    expect(dateInput).toBeInTheDocument();
    await step("fill date input", async () => {
      await userEvent.clear(dateInput);
      await userEvent.type(dateInput, "15051990");
      expect(dateInput).toHaveValue("15/05/1990");
    });
    await step("submit form", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify submitted data contains Date object with noon UTC", () => {
      const submittedData = canvas.getByTestId("debug-data-submitted-data");
      const expectedDate = new Date("1990-05-15T12:00:00.000Z");
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
    const dateInput = canvas.getByTestId("input-date-event-date");
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    await step("verify initial value is displayed", () => {
      expect(dateInput).toHaveValue("25/12/2025");
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const dateInput = canvas.getByTestId("input-date-reminder-date");
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    await step("verify date input is present and optional", () => {
      expect(dateInput).toBeInTheDocument();
    });
    await step("submit form without filling date", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify submitted data contains undefined for optional date", () => {
      expect(submittedData).toContainHTML(stringify({ reminderDate: undefined }, true));
    });
    await step("fill date input and submit form", async () => {
      await userEvent.clear(dateInput);
      await userEvent.type(dateInput, "01112024");
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify submitted data contains the filled date", () => {
      expect(submittedData).toContainHTML(stringify({ reminderDate: new Date("2024-11-01") }, true));
    });
  },
};

/**
 * Optional date field with Zod iso data string
 */
export const OptionalIsoString: Story = {
  args: {
    schemas: [
      z.object({
        reminderDate: field(z.iso.date().optional(), {
          label: "Reminder Date (ISO String)",
          placeholder: "Set a reminder date",
          render: "date",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const dateInput = canvas.getByTestId("input-date-reminder-date");
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    await step("verify date input is present and optional", () => {
      expect(dateInput).toBeInTheDocument();
    });
    await step("submit form without filling date", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify submitted data contains undefined for optional date", () => {
      expect(submittedData).toContainHTML(stringify({}, true));
    });
    await step("fill date input and submit form", async () => {
      await userEvent.clear(dateInput);
      await userEvent.type(dateInput, "01112024");
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify submitted data contains the filled date as ISO string", () => {
      expect(submittedData).toContainHTML(stringify({ reminderDate: "2024-11-01" }, true));
    });
  },
};

/**
 * Optional date field with codec
 */
export const OptionalWithCodec: Story = {
  args: {
    schemas: [
      z.object({
        reminderDateCodec: field(z.date().optional(), {
          label: "Reminder Date with Codec",
          placeholder: "Set a reminder date",
          codec: isoDateStringToDateInstance,
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const dateInput = canvas.getByTestId("input-date-reminder-date-codec");
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    await step("verify date input is present and optional", () => {
      expect(dateInput).toBeInTheDocument();
    });
    await step("submit form without filling date", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify submitted data contains undefined for optional date", () => {
      expect(submittedData).toContainHTML(stringify({}, true));
    });
    await step("fill date input and submit form", async () => {
      await userEvent.clear(dateInput);
      await userEvent.type(dateInput, "01112024");
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify submitted data contains the filled date as ISO string from codec", () => {
      expect(submittedData).toContainHTML(stringify({ reminderDateCodec: "2024-11-01" }, true));
    });
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
    const dateInput = canvas.getByTestId("input-date-lock-date");
    expect(dateInput).toBeDisabled();
    expect(dateInput).toHaveValue("01/01/2025");
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
    const dateInput = canvas.getByTestId("input-date-created-date");
    expect(dateInput).toBeDisabled();
    expect(dateInput).toHaveValue("15/01/2024");
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
    const dateInput = canvas.getByTestId("input-date-string-date");
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    expect(dateInput).toBeInTheDocument();
    await step("fill date input", async () => {
      await userEvent.clear(dateInput);
      await userEvent.type(dateInput, "20032023");
      expect(dateInput).toHaveValue("20/03/2023");
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

/**
 * String date field using render metadata (E2E: fill, submit, verify ISO string output)
 */
export const StringDateWithoutRender: Story = {
  args: {
    initialData: {
      stringDate: "2026-01-07",
      stringDateCodec: "2026-01-14", // we need to provide a string even if we use z.date() because of the codec
      // stringDateCodec: new Date("2026-01-05"), // does not work because the codec validate input
    },
    schemas: [
      z.object({
        stringDate: field(z.iso.date(), {
          label: "String Date Field (no render)",
          placeholder: "Select a date (string)",
        }),
        stringDateCodec: field(z.date(), {
          codec: isoDateStringToDateInstance,
          label: "Select a date (date with codec)",
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dateInput = canvas.getByTestId("input-date-string-date");
    expect(dateInput).toBeInTheDocument();
    expect(dateInput).toHaveValue("07/01/2026");
    const dateCodecInput = canvas.getByTestId("input-date-string-date-codec");
    expect(dateCodecInput).toBeInTheDocument();
    expect(dateCodecInput).toHaveValue("14/01/2026");
  },
};

/**
 * Date now or future validation
 */
export const DateNowOrFuture: Story = {
  args: {
    schemas: [
      z.object({
        appointmentDate: field(dateTodayOrFutureSchema, {
          label: "Appointment Date",
          placeholder: "Select an appointment date",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const dateInput = canvas.getByTestId("input-date-appointment-date");
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    expect(dateInput).toBeInTheDocument();
    await step("fill date input with past date", async () => {
      await userEvent.clear(dateInput);
      await userEvent.type(dateInput, "01012000");
      expect(dateInput).toHaveValue("01/01/2000");
    });
    await step("submit form with past date", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify validation error is shown", () => {
      const errorMessage = canvas.getByText("Date cannot be in the past");
      expect(errorMessage).toBeInTheDocument();
    });
    await step("fill date input with future date", async () => {
      await userEvent.clear(dateInput);
      await userEvent.type(dateInput, "01012100");
      expect(dateInput).toHaveValue("01/01/2100");
    });
    await step("submit form with future date", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify submitted data contains future date", () => {
      expect(submittedData).toContainHTML(stringify({ appointmentDate: new Date("2100-01-01") }, true));
    });
  },
};

/**
 * Date today or future with codec
 */
export const DateTodayOrFutureWithCodec: Story = {
  args: {
    schemas: [
      z.object({
        appointmentDateCodec: field(dateTodayOrFutureSchema, {
          codec: isoDateStringToDateInstance,
          label: "Appointment Date with Codec",
          placeholder: "Select an appointment date",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const dateInput = canvas.getByTestId("input-date-appointment-date-codec");
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    expect(dateInput).toBeInTheDocument();
    await step("fill date input with past date", async () => {
      await userEvent.clear(dateInput);
      await userEvent.type(dateInput, "01012000");
      expect(dateInput).toHaveValue("01/01/2000");
    });
    await step("submit form with past date", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify validation error is shown", () => {
      const errorMessage = canvas.getByText("Date cannot be in the past");
      expect(errorMessage).toBeInTheDocument();
    });
    await step("fill date input with future date", async () => {
      await userEvent.clear(dateInput);
      await userEvent.type(dateInput, "01012100");
      expect(dateInput).toHaveValue("01/01/2100");
    });
    await step("submit form with future date", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify submitted data contains future date as ISO string", () => {
      expect(submittedData).toContainHTML(stringify({ appointmentDateCodec: "2100-01-01" }, true));
    });
  },
};

/**
 * Date now or future validation with initial data value of today
 */
export const DateNowOrFutureWithInitialDataToday: Story = {
  args: {
    initialData: { appointmentDate: new Date(dateIso10()) },
    schemas: [
      z.object({
        appointmentDate: field(dateTodayOrFutureSchema, {
          label: "Appointment Date Initial Data Today",
          placeholder: "Select an appointment date",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const dateInput = canvas.getByTestId("input-date-appointment-date");
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    expect(dateInput).toBeInTheDocument();
    await step("verify initial value is today's date", () => {
      const todayString = dateIso10();
      expect(dateInput).toHaveValue(isoToDisplay(todayString));
    });
    await step("submit form with default today's date", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify submitted data contains today's date", () => {
      expect(submittedData).toContainHTML(stringify({ appointmentDate: new Date(dateIso10()) }, true));
    });
  },
};

/**
 * Date now or future validation with default data in the schema
 */
export const DateNowOrFutureWithDefaultValueToday: Story = {
  args: {
    schemas: [
      z.object({
        appointmentDate: field(dateTodayOrFutureSchema.prefault(today), {
          label: "Appointment Date Default Value Today",
          placeholder: "Select an appointment date",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const dateInput = canvas.getByTestId("input-date-appointment-date");
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    expect(dateInput).toBeInTheDocument();
    await step("verify initial value is today's date from defaultValue", () => {
      const todayString = dateIso10();
      expect(dateInput).toHaveValue(isoToDisplay(todayString));
    });
    await step("submit form with default today's date", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify submitted data contains today's date from defaultValue", () => {
      expect(submittedData).toContainHTML(stringify({ appointmentDate: new Date(dateIso10()) }, true));
    });
  },
};

/**
 * Date from tomorrow to fixed date range validation
 */
export const DateTomorrowToFixed: Story = {
  args: {
    schemas: [
      z.object({
        eventDate: field(
          z
            .date()
            .min(tomorrow, "Date must be on or after tomorrow")
            .max(new Date("2100-12-31"), "Date must be on or before 2100-12-31"),
          {
            label: "Event Date",
            placeholder: "Select an event date",
          },
        ),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const dateInput = canvas.getByTestId("input-date-event-date");
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    expect(dateInput).toBeInTheDocument();
    await step("fill date input with today's date", async () => {
      const todayString = dateIso10();
      await userEvent.clear(dateInput);
      await userEvent.type(dateInput, isoToInput(todayString));
      expect(dateInput).toHaveValue(isoToDisplay(todayString));
    });
    await step("submit form with today's date", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify validation error is shown for today's date", () => {
      const errorMessage = canvas.getByText("Date must be on or after tomorrow");
      expect(errorMessage).toBeInTheDocument();
    });
    await step("fill date input with tomorrow's date", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowString = dateIso10(tomorrow);
      await userEvent.clear(dateInput);
      await userEvent.type(dateInput, isoToInput(tomorrowString));
      expect(dateInput).toHaveValue(isoToDisplay(tomorrowString));
    });
    await step("submit form with tomorrow's date", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify submitted data contains tomorrow's date", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(submittedData).toContainHTML(stringify({ eventDate: new Date(dateIso10(tomorrow)) }, true));
    });
    await step("fill date input with a date after maxDate", async () => {
      await userEvent.clear(dateInput);
      await userEvent.type(dateInput, "01012101");
      expect(dateInput).toHaveValue("01/01/2101");
    });
    await step("submit form with a date after maxDate", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify validation error is shown for date after maxDate", () => {
      const errorMessage = canvas.getByText("Date must be on or before 2100-12-31");
      expect(errorMessage).toBeInTheDocument();
    });
  },
};

/**
 * Date-time field with render: "date-time" (E2E: fill date and time, submit, verify Date object with time)
 */
export const DateTime: Story = {
  args: {
    schemas: [
      z.object({
        appointmentDateTime: field(z.date(), {
          label: "Appointment Date & Time",
          placeholder: "Select date and time",
          render: "date-time",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const dateInput = canvas.getByPlaceholderText("DD/MM/YYYY");
    const timeInput = canvas.getByPlaceholderText("--:--");
    expect(dateInput).toBeInTheDocument();
    expect(timeInput).toBeInTheDocument();
    await step("fill date and time inputs", async () => {
      await userEvent.type(dateInput, "15032026");
      await userEvent.type(timeInput, "0930");
      expect(dateInput).toHaveValue("15/03/2026");
      expect(timeInput).toHaveValue("09:30");
    });
    await step("submit form", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify submitted data contains Date with time", () => {
      const submittedData = canvas.getByTestId("debug-data-submitted-data");
      expect(submittedData).toHaveTextContent("appointmentDateTime");
      expect(submittedData).toHaveTextContent("2026");
    });
  },
};

/**
 * Time-only field with render: "time" (E2E: fill time, submit, verify Date object with time)
 */
export const TimeOnly: Story = {
  args: {
    schemas: [
      z.object({
        wakeUpTime: field(z.string(), {
          label: "Wake Up Time",
          placeholder: "Select wake up time",
          render: "time",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const dateInput = canvas.queryByPlaceholderText("DD/MM/YYYY");
    const timeInput = canvas.getByPlaceholderText("--:--");
    expect(dateInput).not.toBeInTheDocument();
    expect(timeInput).toBeInTheDocument();
    await step("fill time input", async () => {
      await userEvent.type(timeInput, "0700");
      expect(timeInput).toHaveValue("07:00");
    });
    await step("submit form", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify submitted data contains Date with time", () => {
      const submittedData = canvas.getByTestId("debug-data-submitted-data");
      expect(submittedData).toHaveTextContent("wakeUpTime");
      expect(submittedData).toHaveTextContent("07:00");
    });
  },
};
