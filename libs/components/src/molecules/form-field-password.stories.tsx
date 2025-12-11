import { isBrowserEnvironment, Logger, stringify } from "@monorepo/utils";
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
      <div className="grid gap-4">
        <DebugData data={formData} isGhost title="Form data" />
        <AutoForm {...args} logger={logger} onChange={onChange} onSubmit={onSubmit} />
        <DebugData data={submittedData} isGhost title="Submitted data" />
      </div>
    );
  },
  tags: ["autodocs"],
  title: "Commons/Molecules/FormFieldPassword",
} satisfies Meta<typeof AutoForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic password field (E2E: fill, submit, verify string output)
 */
export const Basic: Story = {
  args: {
    schemas: [
      z.object({
        password: z.string().min(8, "Password must be at least 8 characters").meta({
          label: "Password",
          placeholder: "Enter your password",
          render: "password",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const passwordInput = canvas.getByTestId("input-password-password") as HTMLInputElement;
    const submittedData = canvas.getByTestId("debug-data-submitted-data");

    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute("type", "password");

    await step("fill password input", async () => {
      await userEvent.clear(passwordInput);
      await userEvent.type(passwordInput, "SecurePass123");
      expect(passwordInput).toHaveValue("SecurePass123");
    });

    await step("submit form", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });

    await step("verify submitted data contains string", () => {
      expect(submittedData).toContainHTML(stringify({ password: "SecurePass123" }, true));
    });
  },
};

/**
 * Password field with initial value (E2E: verify initial display and submit)
 */
export const WithInitialValue: Story = {
  args: {
    initialData: { password: "InitialPass123" },
    schemas: [
      z.object({
        password: z.string().min(8, "Password must be at least 8 characters").meta({
          label: "Password",
          placeholder: "Enter your password",
          render: "password",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const passwordInput = canvas.getByTestId("input-password-password") as HTMLInputElement;
    const submittedData = canvas.getByTestId("debug-data-submitted-data");

    await step("verify initial value is displayed", () => {
      expect(passwordInput).toHaveValue("InitialPass123");
    });

    await step("submit form with initial value", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });

    await step("verify submitted data matches initial value", () => {
      expect(submittedData).toContainHTML(stringify({ password: "InitialPass123" }, true));
    });
  },
};

/**
 * Optional password field
 */
export const Optional: Story = {
  args: {
    schemas: [
      z.object({
        password: z.string().min(8, "Password must be at least 8 characters").optional().meta({
          label: "Password",
          placeholder: "Enter an optional password",
          render: "password",
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
 * Disabled password field
 */
export const Disabled: Story = {
  args: {
    initialData: { password: "DisabledPass123" },
    schemas: [
      z.object({
        password: z.string().min(8, "Password must be at least 8 characters").meta({
          label: "Password",
          placeholder: "Enter your password",
          render: "password",
          state: "disabled",
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const passwordInput = canvas.getByTestId("input-password-password") as HTMLInputElement;
    expect(passwordInput).toBeDisabled();
    expect(passwordInput).toHaveValue("DisabledPass123");
    expect(passwordInput).toHaveAttribute("type", "password");
  },
};

/**
 * Readonly password field
 */
export const Readonly: Story = {
  args: {
    initialData: { password: "ReadonlyPass123" },
    schemas: [
      z.object({
        password: z.string().min(8, "Password must be at least 8 characters").meta({
          label: "Password",
          placeholder: "Your password",
          render: "password",
          state: "readonly",
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const passwordInput = canvas.getByTestId("input-password-password") as HTMLInputElement;
    expect(passwordInput).toHaveAttribute("readonly");
    expect(passwordInput).toHaveValue("ReadonlyPass123");
    expect(passwordInput).toHaveAttribute("type", "password");
  },
};

/**
 * Multiple password fields with different constraints
 */
export const MultipleFields: Story = {
  args: {
    schemas: [
      z.object({
        confirmPassword: z.string().min(8, "Password must be at least 8 characters").meta({
          label: "Confirm Password",
          placeholder: "Confirm password",
          render: "password",
        }),
        currentPassword: z.string().optional().meta({
          label: "Current Password",
          placeholder: "Optional: enter current password",
          render: "password",
        }),
        password: z.string().min(8, "Password must be at least 8 characters").meta({
          label: "Password",
          placeholder: "Enter password",
          render: "password",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const passwordInput = canvas.getByTestId("input-password-password") as HTMLInputElement;
    const confirmPasswordInput = canvas.getByTestId("input-password-confirm-password") as HTMLInputElement;
    const formData = canvas.getByTestId("debug-data-form-data");
    const submittedData = canvas.getByTestId("debug-data-submitted-data");

    await step("fill password", async () => {
      await userEvent.type(passwordInput, "SecurePass123");
      expect(passwordInput).toHaveValue("SecurePass123");
    });

    await step("fill confirm password", async () => {
      await userEvent.type(confirmPasswordInput, "SecurePass123");
      expect(confirmPasswordInput).toHaveValue("SecurePass123");
    });

    await step("verify form data shows both fields", () => {
      expect(formData).toContainHTML(stringify({ confirmPassword: "SecurePass123", password: "SecurePass123" }, true));
    });

    await step("submit form", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });

    await step("verify submitted data", () => {
      const expectedData = {
        confirmPassword: "SecurePass123",
        password: "SecurePass123",
      };
      expect(submittedData).toContainHTML(stringify(expectedData, true));
    });
  },
};
