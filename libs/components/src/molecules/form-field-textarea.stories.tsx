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
      <div className="mt-6 grid w-lg gap-4">
        <AutoForm {...args} logger={logger} onSubmit={onSubmit} />
        <DebugData data={submittedData} isGhost title="Submitted data" />
      </div>
    );
  },
  tags: ["autodocs"],
  title: "Commons/Molecules/FormFieldTextarea",
} satisfies Meta<typeof AutoForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic textarea field (E2E: fill, submit, verify string output)
 */
export const Basic: Story = {
  args: {
    schemas: [
      z.object({
        description: field(z.string(), {
          label: "Description",
          placeholder: "Enter your description",
          render: "textarea",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByTestId("textarea-description") as HTMLTextAreaElement;
    const submittedData = canvas.getByTestId("debug-data-submitted-data");

    expect(textarea).toBeInTheDocument();

    await step("fill textarea", async () => {
      await userEvent.clear(textarea);
      await userEvent.type(textarea, "This is a test description");
      expect(textarea).toHaveValue("This is a test description");
    });

    await step("submit form", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });

    await step("verify submitted data contains string", () => {
      expect(submittedData).toContainHTML(stringify({ description: "This is a test description" }, true));
    });
  },
};

/**
 * Textarea field with initial value (E2E: verify initial display and submit)
 */
export const WithInitialValue: Story = {
  args: {
    initialData: { content: "Lorem ipsum dolor sit amet" },
    schemas: [
      z.object({
        content: field(z.string(), {
          label: "Content",
          placeholder: "Enter your content",
          render: "textarea",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByTestId("textarea-content") as HTMLTextAreaElement;
    const submittedData = canvas.getByTestId("debug-data-submitted-data");

    await step("verify initial value is displayed", () => {
      expect(textarea).toHaveValue("Lorem ipsum dolor sit amet");
    });

    await step("submit form with initial value", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });

    await step("verify submitted data matches initial value", () => {
      expect(submittedData).toContainHTML(stringify({ content: "Lorem ipsum dolor sit amet" }, true));
    });
  },
};

/**
 * Optional textarea field
 */
export const Optional: Story = {
  args: {
    schemas: [
      z.object({
        notes: field(z.string().optional(), {
          label: "Notes",
          placeholder: "Enter optional notes",
          render: "textarea",
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole("button", { name: "Submit" });
    expect(submitButton).not.toBeDisabled();
  },
};

/**
 * Disabled textarea field
 */
export const Disabled: Story = {
  args: {
    initialData: { feedback: "This is disabled feedback" },
    schemas: [
      z.object({
        feedback: field(z.string(), {
          label: "Feedback",
          placeholder: "Your feedback",
          render: "textarea",
          state: "disabled",
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByTestId("textarea-feedback") as HTMLTextAreaElement;
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveValue("This is disabled feedback");
  },
};

/**
 * Readonly textarea field
 */
export const Readonly: Story = {
  args: {
    initialData: { terms: "By using this service, you agree to our terms and conditions." },
    schemas: [
      z.object({
        terms: field(z.string(), {
          label: "Terms & Conditions",
          placeholder: "Your terms",
          render: "textarea",
          state: "readonly",
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByTestId("textarea-terms") as HTMLTextAreaElement;
    expect(textarea).toHaveAttribute("readonly");
    expect(textarea).toHaveValue("By using this service, you agree to our terms and conditions.");
  },
};

/**
 * Multiple textarea fields with different constraints
 */
export const MultipleFields: Story = {
  args: {
    schemas: [
      z.object({
        details: field(z.string().optional(), {
          label: "Additional Details",
          placeholder: "Optional: enter additional details",
          render: "textarea",
        }),
        summary: field(z.string(), {
          label: "Summary",
          placeholder: "Enter a brief summary",
          render: "textarea",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const summaryTextarea = canvas.getByTestId("textarea-summary") as HTMLTextAreaElement;
    const detailsTextarea = canvas.getByTestId("textarea-details") as HTMLTextAreaElement;
    const submittedData = canvas.getByTestId("debug-data-submitted-data");

    await step("fill summary", async () => {
      await userEvent.type(summaryTextarea, "This is the summary");
      expect(summaryTextarea).toHaveValue("This is the summary");
    });

    await step("fill details", async () => {
      await userEvent.type(detailsTextarea, "These are the details");
      expect(detailsTextarea).toHaveValue("These are the details");
    });

    await step("submit form", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });

    await step("verify submitted data", () => {
      const expectedData = {
        details: "These are the details",
        summary: "This is the summary",
      };
      expect(submittedData).toContainHTML(stringify(expectedData, true));
    });
  },
};

/**
 * Long text in textarea field
 */
export const LongText: Story = {
  args: {
    initialData: {
      article: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`,
    },
    schemas: [
      z.object({
        article: field(z.string(), {
          label: "Article",
          placeholder: "Enter your article",
          render: "textarea",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByTestId("textarea-article") as HTMLTextAreaElement;

    await step("verify long text is displayed", () => {
      expect(textarea.value.length).toBeGreaterThan(100);
    });

    await step("submit form", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
  },
};
