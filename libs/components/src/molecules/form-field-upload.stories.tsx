import { isBrowserEnvironment, Logger, nbHueMax, sleep } from "@monorepo/utils";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { z } from "zod";
import { AutoForm } from "./auto-form";
import type { AutoFormData } from "./auto-form.types";
import { field } from "./auto-form.utils";
import { DebugData } from "./debug-data";
import { fileSchema } from "./form-field-upload.const";

const logger = new Logger({ minimumLevel: isBrowserEnvironment() ? "3-info" : "5-warn" });

const meta = {
  component: AutoForm,
  parameters: {
    docs: {
      description: {
        component: "A file upload field component with progress tracking, validation, and error handling. Integrates with AutoForm for automatic form generation.",
      },
    },
    layout: "centered",
  },
  render: args => {
    const [submittedData, setSubmittedData] = useState<AutoFormData>();
    function onSubmit(data: AutoFormData) {
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
  title: "Commons/Molecules/FormFieldUpload",
} satisfies Meta<typeof AutoForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    schemas: [
      z.object({
        document: field(z.file().optional(), {
          label: "Optional document",
          placeholder: "Select a document",
        }),
      }),
    ],
  },
};

export const Required: Story = {
  args: {
    schemas: [
      z.object({
        document: field(z.file(), {
          label: "Required document",
          placeholder: "Select a required file",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    await step("cannot submit form initially", () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      expect(submitButton).toBeEnabled();
      expect(submittedData).toContainHTML("undefined");
    });
    await step("upload a file successfully and submit the form", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      const file = new File(["hello"], "test-doc.pdf", { type: "application/pdf" });
      const input = canvas.getByTestId("input-file-document-upload-idle") as HTMLInputElement;
      await userEvent.upload(input, file);
      await sleep(nbHueMax); // needed
      expect(submittedData).toContainHTML("undefined");
      await userEvent.click(submitButton);
      expect(submittedData).toContainHTML("test-doc.pdf");
    });
    await step("remove the file and check that form cannot be submitted", async () => {
      const removeButton = canvas.getByRole("button", { name: "Remove" });
      await userEvent.click(removeButton);
      const errorMessage = canvas.getByTestId("form-message-document");
      expect(errorMessage).toHaveTextContent("Invalid input: expected file, received undefined");
    });
  },
};

export const ExistingFile: Story = {
  args: {
    initialData: {
      document: new File(["test"], "test.txt", { type: "text/plain" }),
    },
    schemas: [
      z.object({
        document: field(z.file(), {
          label: "Document required",
          placeholder: "Select a document",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    await step("shows the existing file in the upload field", () => {
      const fileInput = canvas.getByTestId("document-upload-success") as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();
      expect(submittedData).toContainHTML("undefined");
    });
    await step("submit the form with the existing file", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      expect(submitButton).not.toBeDisabled();
      await userEvent.click(submitButton);
      expect(submittedData).toContainHTML("test.txt");
    });
  },
};

export const FileSchemaValidation: Story = {
  args: {
    schemas: [
      z.object({
        document: field(fileSchema(["pdf", "jpg", "png"], true), {
          label: "Image or PDF document",
          placeholder: "Select a PDF or image file",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    await step("accepts valid pdf", async () => {
      const input = canvas.getByTestId("input-file-document-upload-idle") as HTMLInputElement;
      const file = new File(["test"], "document.pdf", { type: "application/pdf" });
      await userEvent.upload(input, file);
      await sleep(nbHueMax);
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      expect(submitButton).toBeEnabled();
      await userEvent.click(submitButton);
      expect(submittedData).toContainHTML("document.pdf");
    });
    await step("rejects invalid txt file", async () => {
      const removeButton = canvas.getByRole("button", { name: "Remove" });
      await userEvent.click(removeButton);
      const input = canvas.getByTestId("input-file-document-upload-idle") as HTMLInputElement;
      const file = new File(["test"], "document.txt", { type: "text/plain" });
      await userEvent.upload(input, file);
      await sleep(nbHueMax);
      const errorMessage = canvas.getByTestId("form-message-document");
      expect(errorMessage).toHaveTextContent("File extension not allowed, accepted : pdf, jpg, png");
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      expect(submitButton).toBeEnabled();
    });
  },
};

export const ResponsiveLayout: Story = {
  args: {
    initialData: {
      document: new File(["test content"], "very-long-filename-that-might-overflow-on-small-screens.pdf", {
        type: "application/pdf",
      }),
    },
    schemas: [
      z.object({
        document: field(z.file(), {
          label: "Document upload",
          placeholder: "Select a file to upload",
        }),
      }),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: "Demonstrates the FormFieldUpload responsiveness across different viewport sizes. Resize your browser window or use the viewport toolbar to see how the component adapts to mobile, tablet, and desktop screens.",
      },
    },
    layout: "padded",
    viewport: {
      defaultViewport: "responsive",
    },
  },
  render: args => {
    type FormData = { document?: File } | undefined;
    function onSubmit(data: FormData) {
      logger.showSuccess("Form submitted successfully", data);
    }
    return (
      <div className="grid gap-8 w-full mx-auto p-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Full width</h2>
          <p className="text-muted-foreground text-sm">Full width with all elements visible</p>
          <AutoForm {...args} logger={logger} onSubmit={onSubmit} />
        </div>

        <div className="space-y-2 max-w-xl">
          <h2 className="text-2xl font-bold">XLarge width</h2>
          <p className="text-muted-foreground text-sm">Constrained to ~768px width</p>
          <AutoForm {...args} logger={logger} onSubmit={onSubmit} />
        </div>

        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-bold">Medium width</h2>
          <p className="text-muted-foreground text-sm">Constrained to ~448px width</p>
          <AutoForm {...args} logger={logger} onSubmit={onSubmit} />
        </div>
      </div>
    );
  },
};
