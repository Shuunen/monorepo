import { isBrowserEnvironment, Logger, stringify } from "@monorepo/utils";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { z } from "zod";
import { AutoForm } from "./auto-form";
import { field, fields, step } from "./auto-form.utils";
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
      <div className="mt-6 grid w-lg gap-4">
        <AutoForm {...args} logger={logger} onSubmit={onSubmit} />
        <DebugData data={submittedData} isGhost title="Submitted data" />
      </div>
    );
  },
  tags: ["autodocs"],
  title: "Commons/Molecules/FormFieldFieldList",
} satisfies Meta<typeof AutoForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const applicantSchema = field(z.string(), {
  label: "Applicant's Name",
  placeholder: "Enter the name of the applicant",
});

const applicantListSchema = step(
  z.object({
    applicants: fields(applicantSchema, {
      label: "Fill in the applicants",
      maxItems: 5,
      minItems: 1,
      placeholder: "Please add at least one applicant, you can add up to 5.",
    }),
  }),
);

/**
 * Basic list
 */
export const Basic: Story = {
  args: {
    schemas: [applicantListSchema],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole("button", { name: "Submit" });
    const applicantInput = canvas.getByTestId("input-text-applicants-0");
    await userEvent.type(applicantInput, "Alice");
    await userEvent.click(submitButton);
    await expect(canvas.getByTestId("debug-data-submitted-data")).toContainHTML(
      stringify({ applicants: ["Alice"] }, true),
    );

    const addButton = canvas.getByTestId("button-add-applicants");
    await userEvent.click(addButton);
    const applicantInput2 = canvas.getByTestId("input-text-applicants-1");
    await userEvent.type(applicantInput2, "Bob");
    await userEvent.click(submitButton);
    await expect(canvas.getByTestId("debug-data-submitted-data")).toContainHTML(
      stringify({ applicants: ["Alice", "Bob"] }, true),
    );

    const deleteButton = canvas.getByTestId("button-delete-applicants-1");
    await userEvent.click(deleteButton);
    await userEvent.click(submitButton);
    await expect(canvas.getByTestId("debug-data-submitted-data")).toContainHTML(
      stringify({ applicants: ["Alice"] }, true),
    );
  },
};

/**
 * List with data
 */
export const ListWithData: Story = {
  args: {
    initialData: {
      applicants: ["Alice", "Bob"],
    },
    schemas: [applicantListSchema],
  },
};

const applicantSchemaOptional = field(z.string().optional(), {
  label: "Applicant's Name",
  placeholder: "Enter the name of the applicant",
});

/**
 * List with optional items
 */
export const ListWithOptionalItems: Story = {
  args: {
    schemas: [
      z.object({
        applicants: fields(applicantSchemaOptional, {
          label: "Fill in the applicants",
          maxItems: 5,
          minItems: 1,
          placeholder: "Please add at least one applicant, you can add up to 5.",
        }),
      }),
    ],
  },
};

const ListOfDateSchema = z.object({
  dates: fields(
    field(z.date().optional(), {
      label: "Date (optional)",
      placeholder: "Select the date",
    }),
    {
      label: "Fill in the dates",
    },
  ),
});

/**
 * List of dates
 */
export const ListOfDates: Story = {
  args: {
    schemas: [ListOfDateSchema],
  },
};

/**
 * List of dates with data
 */
export const ListOfDatesWithData: Story = {
  args: {
    initialData: {
      dates: [new Date()],
    },
    schemas: [ListOfDateSchema],
  },
};

const listOfSelectSchema = z.object({
  fruits: fields(
    field(z.enum(["apple", "banana", "cherry"]), {
      label: "Fruit",
      options: [
        { label: "Apple", value: "apple" },
        { label: "Banana", value: "banana" },
        { label: "Cherry", value: "cherry" },
      ],
      placeholder: "Select the fruit",
    }),
    {
      label: "Fill in the fruits",
    },
  ),
});

/**
 * List of select
 */
export const ListOfSelect: Story = {
  args: {
    schemas: [listOfSelectSchema],
  },
};

/**
 * List of select with data
 */
export const ListOfSelectWithData: Story = {
  args: {
    initialData: {
      fruits: ["apple", "banana"],
    },
    schemas: [listOfSelectSchema],
  },
};

const applicantReferenceSchema = field(z.string(), {
  label: "Applicant's reference",
  placeholder: "Enter the reference of the applicant",
});

/**
 * List initialized with 3 items fixed
 */
export const ListInitializedFixed: Story = {
  args: {
    schemas: [
      step(
        z.object({
          applicantReferences: fields(applicantReferenceSchema, {
            label: "Fill in the applicant references",
            nbItems: 3,
            placeholder: "Please fill the applicant references",
          }),
        }),
      ),
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submittedData = canvas.getByTestId("debug-data-submitted-data");

    const applicantInput = await canvas.findAllByRole("textbox");
    expect(applicantInput).toHaveLength(3);

    const firstInput = canvas.getByTestId("input-text-applicant-references-0");
    await userEvent.type(firstInput, "ref-1");
    const secondInput = canvas.getByTestId("input-text-applicant-references-1");
    await userEvent.type(secondInput, "ref-2");

    const submitButton = canvas.getByRole("button", { name: "Submit" });
    await userEvent.click(submitButton);

    const errors = canvas.getAllByRole("alert");
    expect(errors).toHaveLength(1);
    expect(errors[0]).toHaveTextContent("Invalid input: expected string, received undefined");

    const thirdInput = canvas.getByTestId("input-text-applicant-references-2");
    await userEvent.type(thirdInput, "ref-3");
    await userEvent.click(submitButton);

    await expect(submittedData).toContainHTML(stringify({ applicantReferences: ["ref-1", "ref-2", "ref-3"] }, true));
  },
};

/**
 * List initialized with 3 items dynamic
 */
export const ListInitializedDynamic: Story = {
  args: {
    initialData: {
      applicants: ["John Doe", "Jane Smith", "Alice Johnson"],
    },
    schemas: [
      step(
        z.object({
          applicants: fields(
            field(z.string(), {
              label: "Fill in the applicants",
              placeholder: "Please add at least one applicant.",
            }),
          ),
        }),
      ),
      step(
        z.object({
          applicantReferences: fields(applicantReferenceSchema, {
            label: "Fill in the applicant references",
            nbItems: (formValues?: Record<string, unknown>) =>
              Array.isArray(formValues?.applicants) ? formValues.applicants.length : 0,
            placeholder: "Please fill the applicant references",
          }),
        }),
      ),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const submittedData = canvas.getByTestId("debug-data-submitted-data");

    await step("check step 1", async () => {
      const applicantInput = await canvas.findAllByRole("textbox");
      expect(applicantInput).toHaveLength(3);

      const firstInput = canvas.getByTestId("input-text-applicants-0");
      expect(firstInput).toHaveValue("John Doe");
      const secondInput = canvas.getByTestId("input-text-applicants-1");
      expect(secondInput).toHaveValue("Jane Smith");
      const thirdInput = canvas.getByTestId("input-text-applicants-2");
      expect(thirdInput).toHaveValue("Alice Johnson");

      const nextButton = canvas.getByRole("button", { name: "Next" });
      await userEvent.click(nextButton);
    });

    await step("check step 2", async () => {
      const referenceInputs = await canvas.findAllByRole("textbox");
      expect(referenceInputs).toHaveLength(3);

      const firstInput = canvas.getByTestId("input-text-applicant-references-0");
      await userEvent.type(firstInput, "ref-1");
      const secondInput = canvas.getByTestId("input-text-applicant-references-1");
      await userEvent.type(secondInput, "ref-2");

      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);

      const errors = canvas.getAllByRole("alert");
      expect(errors).toHaveLength(1);
      expect(errors[0]).toHaveTextContent("Invalid input: expected string, received undefined");

      const thirdInput = canvas.getByTestId("input-text-applicant-references-2");
      await userEvent.type(thirdInput, "ref-3");
      await userEvent.click(submitButton);
      expect(submittedData).toContainHTML(
        stringify(
          {
            applicants: ["John Doe", "Jane Smith", "Alice Johnson"],
            applicantReferences: ["ref-1", "ref-2", "ref-3"],
          },
          true,
        ),
      );
    });

    await step("change step 1 data and check step 2 updates", async () => {
      const backButton = canvas.getByRole("button", { name: "Back" });
      await userEvent.click(backButton);

      const deleteButton = canvas.getByTestId("button-delete-applicants-1");
      await userEvent.click(deleteButton);

      const nextButton = canvas.getByRole("button", { name: "Next" });
      await userEvent.click(nextButton);

      const referenceInputs = await canvas.findAllByRole("textbox");
      expect(referenceInputs).toHaveLength(2);

      const firstInput = canvas.getByTestId("input-text-applicant-references-0");
      expect(firstInput).toHaveValue("ref-1");
      const secondInput = canvas.getByTestId("input-text-applicant-references-1");
      expect(secondInput).toHaveValue("ref-2");

      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
      expect(submittedData).toContainHTML(
        stringify(
          {
            applicants: ["John Doe", "Alice Johnson"],
            applicantReferences: ["ref-1", "ref-2"],
          },
          true,
        ),
      );
    });
  },
};
