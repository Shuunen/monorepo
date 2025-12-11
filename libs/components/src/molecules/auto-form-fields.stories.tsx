/** biome-ignore-all assist/source/useSortedKeys: not needed here */
import { isBrowserEnvironment, Logger, sleep, stringify } from "@monorepo/utils";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { z } from "zod";
import { AutoForm } from "./auto-form";
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
  title: "Commons/Molecules/AutoFormFields",
} satisfies Meta<typeof AutoForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const allFieldsSchema = z.object({
  // Boolean (Switch)
  booleanCode: z.string().meta({
    description: "The default render of a ZodBoolean : a toggle switch. For more details, check the FormFieldBoolean story.",
    render: "section",
    title: "Boolean",
  }),
  booleanField: z.boolean().optional().meta({
    placeholder: "Turn on or off",
  }),
  booleanFieldCode: z.string().meta({
    code: 'z.boolean().meta({ placeholder: "Turn on or off" })',
    line: true,
    render: "section",
  }),
  // Accept (Radio buttons with Accept/Reject)
  acceptTitle: z.string().meta({
    description: "A custom render of a ZodBoolean. This field displays accept/reject options. For more details, check the FormFieldAccept story.",
    render: "section",
    title: "Boolean accept",
  }),
  acceptField: z.boolean().optional().meta({
    render: "accept",
  }),
  acceptCode: z.string().meta({
    code: 'z.boolean().meta({ render: "accept" })',
    line: true,
    render: "section",
  }),
  // Date
  dateCode: z.string().meta({
    description: "The default render of a ZodDate : a date picker field for selecting a single day. For more details, check the FormFieldDate story.",
    render: "section",
    title: "Date",
  }),
  dateField: z.date().optional().meta({
    placeholder: "Select a date",
  }),
  dateFieldCode: z.string().meta({
    code: "z.date() // date object",
    line: true,
    render: "section",
  }),
  // String as Date
  stringDateCode: z.string().meta({
    description: "A custom render of a ZodString. This field will also render as a date picker. For more details, check the FormFieldDate story.",
    render: "section",
    title: "Date string",
  }),
  stringDateField: z.string().optional().meta({
    placeholder: "Select a date as string",
    render: "date",
  }),
  stringDateFieldCode: z.string().meta({
    code: 'z.string().meta({ render: "date" }) // string containing a date',
    line: true,
    render: "section",
  }),
  // Email (text variant)
  emailCode: z.string().meta({
    description: "An email input field with built-in validation. For more details, check the FormFieldText story.",
    render: "section",
    title: "Email",
  }),
  emailField: z.email("Invalid email").optional().meta({
    placeholder: "your@email.com",
  }),
  emailFieldCode: z.string().meta({
    code: 'z.email("Invalid email").meta({ placeholder: "your@email.com" })',
    line: true,
    render: "section",
  }),
  // Select
  selectCode: z.string().meta({
    description: "A dropdown select field for choosing from predefined options. For more details, check the FormFieldSelect story.",
    render: "section",
    title: "Select",
  }),
  selectField: z.enum(["option1", "option2", "option3"]).optional().meta({
    placeholder: "Choose an option",
  }),
  selectFieldCode: z.string().meta({
    code: "z.enum(['option1', ...]).meta({ placeholder: 'Choose an option' })",
    line: true,
    render: "section",
  }),
  // Number
  numberCode: z.string().meta({
    description: "A numeric input field with min/max constraints. For more details, check the FormFieldNumber story.",
    render: "section",
    title: "Number",
  }),
  numberField: z.number().min(0).max(100).optional().meta({
    placeholder: "Enter a number between 0-100",
  }),
  numberFieldCode: z.string().meta({
    code: "z.number().min(0).max(100)",
    line: true,
    render: "section",
  }),
  // Text input
  textCode: z.string().meta({
    description: "The default render of a ZodString : a basic single-line text input field. For more details, check the FormFieldText story.",
    render: "section",
    title: "Text",
  }),
  textField: z.string().optional().meta({
    placeholder: "Enter some text",
  }),
  textFieldCode: z.string().meta({
    code: 'z.string().meta({ placeholder: "Enter some text" })',
    line: true,
    render: "section",
  }),
  // Textarea
  textareaCode: z.string().meta({
    description: "A custom render of a ZodString. This field will render as a multi-line text input. For more details, check the FormFieldTextarea story.",
    render: "section",
    title: "Textarea",
  }),
  textareaField: z.string().optional().meta({
    placeholder: "Enter multiple lines",
    render: "textarea",
  }),
  textareaFieldCode: z.string().meta({
    code: 'z.string().meta({ render: "textarea" })',
    line: true,
    render: "section",
  }),
  // Password
  passwordCode: z.string().meta({
    description: "A custom render of a ZodString. This field renders as a password input field. For more details, check the FormFieldPassword story.",
    render: "section",
    title: "Password",
  }),
  passwordField: z.string().optional().meta({
    placeholder: "Enter a password",
    render: "password",
  }),
  passwordFieldCode: z.string().meta({
    code: 'z.string().meta({ render: "password" })',
    line: true,
    render: "section",
  }),
});

/**
 * Showcase of all available form-field types in editable state
 * Displays one instance of each field type: text, textarea, email, number, date, boolean, enum, accept, and password
 */
export const AllFields: Story = {
  args: {
    schemas: [allFieldsSchema],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole("button", { name: "Submit" });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeEnabled();
  },
};

export const AllFieldsFilled: Story = {
  args: {
    schemas: [allFieldsSchema],
    initialData: {
      acceptField: true,
      booleanField: true,
      dateField: new Date("2023-01-01"),
      emailField: "user@example.com",
      selectField: "option1",
      numberField: 50,
      stringDateField: "2023-06-15",
      textField: "Sample text",
      textareaField: "Sample textarea",
      passwordField: "Sample password",
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const formData = canvas.getByTestId("debug-data-form-data");
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    const submitButton = canvas.getByRole("button", { name: "Submit" });
    const expectedData = {
      booleanField: true,
      acceptField: true,
      dateField: new Date("2023-01-01"),
      stringDateField: "2023-06-15",
      emailField: "user@example.com",
      selectField: "option1",
      numberField: 50,
      textField: "Sample text",
      textareaField: "Sample textarea",
      passwordField: "Sample password",
    };
    await step("initial state", async () => {
      await sleep(50);
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toBeEnabled();
      expect(formData).toContainHTML(stringify(expectedData, true));
      expect(submittedData).toContainHTML(stringify({}));
      await userEvent.click(submitButton);
    });
    await step("after submit", () => {
      expect(submittedData).toContainHTML(stringify(expectedData, true));
    });
  },
};
