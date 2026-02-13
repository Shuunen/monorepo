/** biome-ignore-all assist/source/useSortedKeys: not needed here */
import { isBrowserEnvironment, Logger, sleep, stringify } from "@monorepo/utils";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { z } from "zod";
import { AutoForm } from "./auto-form";
import type { AutoFormData } from "./auto-form.types";
import { field, fields, forms, section } from "./auto-form.utils";
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
  title: "Commons/Molecules/AutoFormFields",
} satisfies Meta<typeof AutoForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const allFieldsSchema = z.object({
  // Boolean (Switch)
  booleanCode: section({
    description:
      "The default render of a ZodBoolean : a toggle switch. For more details, check the FormFieldBoolean story.",
    title: "Boolean switch",
  }),
  booleanField: field(z.boolean().optional(), {
    placeholder: "Turn on or off",
  }),
  booleanFieldCode: section({
    code: 'z.boolean().meta({ placeholder: "Turn on or off" })',
    line: true,
  }),
  // Accept (Radio buttons with Accept/Reject)
  acceptTitle: section({
    description:
      "A custom render of a ZodBoolean. This field displays accept/reject options. For more details, check the FormFieldAccept story.",
    title: "Boolean accept",
  }),
  acceptField: field(z.boolean().optional(), {
    render: "accept",
  }),
  acceptCode: section({
    code: 'z.boolean().meta({ render: "accept" })',
    line: true,
  }),
  // Date
  dateCode: section({
    description:
      "The default render of a ZodDate : a date picker field for selecting a single day. For more details, check the FormFieldDate story.",
    title: "Date",
  }),
  dateField: field(z.date().optional(), {
    placeholder: "Select a date",
  }),
  dateFieldCode: section({
    code: "z.date() // date object",
    line: true,
  }),
  // String as Date
  stringDateCode: section({
    description:
      "A custom render of a ZodString. This field will also render as a date picker. For more details, check the FormFieldDate story.",
    title: "Date string",
  }),
  stringDateField: field(z.string().optional(), {
    placeholder: "Select a date as string",
    render: "date",
  }),
  stringDateFieldCode: section({
    code: 'z.string().meta({ render: "date" }) // string containing a date',
    line: true,
  }),
  // Email (text variant)
  emailCode: section({
    description: "An email input field with built-in validation. For more details, check the FormFieldText story.",
    title: "Email",
  }),
  emailField: field(z.email("Invalid email").optional(), {
    placeholder: "your@email.com",
  }),
  emailFieldCode: section({
    code: 'z.email("Invalid email").meta({ placeholder: "your@email.com" })',
    line: true,
  }),
  // Select
  selectCode: section({
    description:
      "A dropdown select field for choosing from predefined options. For more details, check the FormFieldSelect story.",
    title: "Select",
  }),
  selectField: field(z.enum(["option1", "option2", "option3"]).optional(), {
    placeholder: "Choose an option",
  }),
  selectFieldCode: section({
    code: "z.enum(['option1', ...]).meta({ placeholder: 'Choose an option' })",
    line: true,
  }),
  // Number
  numberCode: section({
    description: "A numeric input field with min/max constraints. For more details, check the FormFieldNumber story.",
    title: "Number",
  }),
  numberField: field(z.number().min(0).max(100).optional(), {
    placeholder: "Enter a number between 0-100",
  }),
  numberFieldCode: section({
    code: "z.number().min(0).max(100)",
    line: true,
  }),
  // Text input
  textCode: section({
    description:
      "The default render of a ZodString : a basic single-line text input field. For more details, check the FormFieldText story.",
    title: "Text",
  }),
  textField: field(z.string().optional(), {
    placeholder: "Enter some text",
  }),
  textFieldCode: section({
    code: 'z.string().meta({ placeholder: "Enter some text" })',
    line: true,
  }),
  // Textarea
  textareaCode: section({
    description:
      "A custom render of a ZodString. This field will render as a multi-line text input. For more details, check the FormFieldTextarea story.",
    title: "Textarea",
  }),
  textareaField: field(z.string().optional(), {
    placeholder: "Enter multiple lines",
    render: "textarea",
  }),
  textareaFieldCode: section({
    code: 'z.string().meta({ render: "textarea" })',
    line: true,
  }),
  // Password
  passwordCode: section({
    description:
      "A custom render of a ZodString. This field renders as a password input field. For more details, check the FormFieldPassword story.",
    title: "Password",
  }),
  passwordField: field(z.string().optional(), {
    placeholder: "Enter a password",
    render: "password",
  }),
  passwordFieldCode: section({
    code: 'z.string().meta({ render: "password" })',
    line: true,
  }),
  // Radio
  radioCode: section({
    description:
      "A custom render of a ZodEnum. This field displays radio buttons instead of a dropdown select. For more details, check the FormFieldRadio story.",
    title: "Radio",
  }),
  radioField: field(z.enum(["option1", "option2", "option3"]).optional(), {
    placeholder: "Pick one option",
    render: "radio",
  }),
  radioFieldCode: section({
    code: 'z.enum(["option1", ...]).meta({ render: "radio" })',
    line: true,
  }),
  // Field List
  fieldListCode: section({
    description:
      "A repeatable list of simple fields. Users can add and remove items dynamically. For more details, check the FormFieldFieldList story.",
    title: "Field list",
  }),
  fieldListField: fields(
    field(z.string().optional(), {
      label: "Item",
      placeholder: "Enter an item",
    }),
    {
      label: "Items",
      maxItems: 3,
      placeholder: "Add up to 3 items.",
    },
  ),
  fieldListFieldCode: section({
    code: 'fields(field(z.string(), { label: "Item" }), { maxItems: 3 })',
    line: true,
  }),
  // Form List
  formListCode: section({
    description:
      "A repeatable list of sub-forms. Each item opens a form for detailed data entry. For more details, check the FormFieldFormList story.",
    title: "Form list",
  }),
  formListField: forms(
    z.object({
      name: field(z.string().optional(), {
        label: "Name",
        placeholder: "Enter a name",
      }),
    }),
    {
      identifier: data => (data?.name ? String(data.name) : "New item"),
      label: "Entries",
      maxItems: 3,
      placeholder: "Add up to 3 entries.",
    },
  ),
  formListFieldCode: section({
    code: "forms(z.object({ name: field(...) }), { identifier: ..., maxItems: 3 })",
    line: true,
  }),
});

/**
 * Showcase of all available form-field types in editable state
 * Displays one instance of each field type: text, textarea, email, number, date, boolean, enum, accept, password, radio, field list, and form list
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
      radioField: "option2",
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
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
      radioField: "option2",
      fieldListField: [null],
    };
    await step("initial state", async () => {
      await sleep(50);
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toBeEnabled();
      expect(submittedData).toContainHTML(stringify({}));
      await userEvent.click(submitButton);
    });
    await step("after submit", () => {
      expect(submittedData).toContainHTML(stringify(expectedData, true));
    });
  },
};
