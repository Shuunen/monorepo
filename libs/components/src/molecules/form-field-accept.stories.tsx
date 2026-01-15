import { isBrowserEnvironment, Logger, sleep } from "@monorepo/utils";
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
  title: "Commons/Molecules/FormFieldAccept",
} satisfies Meta<typeof AutoForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    schemas: [
      z.object({
        agreedToTerms: field(z.boolean(), {
          label: "I agree to the Terms and Conditions",
          placeholder: "Please accept the terms",
          render: "accept",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const radioGroup = canvas.getByTestId("radio-agreed-to-terms");
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    await step("verify radio group is rendered", () => {
      expect(radioGroup).toBeInTheDocument();
    });
    await step("check radio group initial state", () => {
      expect(submittedData).toContainHTML(`{}`);
    });
    await step("check first option", async () => {
      const acceptOption = canvas.getByLabelText("Accept");
      const rejectOption = canvas.getByLabelText("Reject");
      expect(acceptOption).toBeInTheDocument();
      expect(rejectOption).toBeInTheDocument();
      await userEvent.click(acceptOption);
      await sleep(1);
      expect(acceptOption).toBeChecked();
      expect(rejectOption).not.toBeChecked();
    });
    await step("verify form data", () => {
      expect(submittedData).toContainHTML(`{}`);
    });
    await step("check second option", async () => {
      const acceptOption = canvas.getByLabelText("Accept");
      const rejectOption = canvas.getByLabelText("Reject");
      await userEvent.click(rejectOption);
      await sleep(1);
      expect(acceptOption).not.toBeChecked();
      expect(rejectOption).toBeChecked();
    });
    await step("verify updated form data", () => {
      expect(submittedData).toContainHTML(`{}`);
    });
    await step("submit form", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify submitted data", () => {
      expect(submittedData).toContainHTML(`"agreedToTerms": false`);
    });
  },
};

export const Readonly: Story = {
  args: {
    initialData: {
      agreedToTerms: true,
    },
    schemas: [
      z.object({
        agreedToTerms: field(z.boolean(), {
          label: "I agree to the Terms and Conditions",
          placeholder: "Please accept the terms",
          render: "accept",
          state: "readonly",
        }),
      }),
    ],
  },
};

export const Disabled: Story = {
  args: {
    initialData: {
      agreedToTerms: false,
    },
    schemas: [
      z.object({
        agreedToTerms: field(z.boolean(), {
          label: "I agree to the Terms and Conditions",
          placeholder: "Please accept the terms",
          render: "accept",
          state: "disabled",
        }),
      }),
    ],
  },
};
