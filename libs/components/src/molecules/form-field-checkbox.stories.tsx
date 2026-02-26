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
  title: "Commons/Molecules/FormFieldCheckbox",
} satisfies Meta<typeof AutoForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic checkbox field rendered with render: "checkbox"
 */
export const Basic: Story = {
  args: {
    schemas: [
      z.object({
        agreedToTerms: field(z.boolean(), {
          label: "I agree to the Terms and Conditions",
          placeholder: "Please accept the terms",
          render: "checkbox",
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByTestId("checkbox-agreed-to-terms");
    expect(checkbox).toBeInTheDocument();
  },
};

/**
 * Checkbox field with initial true value (E2E: verify initial state and toggle)
 */
export const WithInitialValueTrue: Story = {
  args: {
    initialData: { enableNotifications: true },
    schemas: [
      z.object({
        enableNotifications: field(z.boolean(), {
          label: "Enable Email Notifications",
          placeholder: "Receive email updates",
          render: "checkbox",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByTestId("checkbox-enable-notifications");
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    await step("verify initial value is true", () => {
      expect(checkbox).toHaveAttribute("data-state", "checked");
    });
    await step("submit form with initial value", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify submitted data matches initial value", () => {
      expect(submittedData).toContainHTML(stringify({ enableNotifications: true }, true));
    });
  },
};

/**
 * Checkbox field with initial false value
 */
export const WithInitialValueFalse: Story = {
  args: {
    initialData: { shareData: false },
    schemas: [
      z.object({
        shareData: field(z.boolean(), {
          label: "Share anonymized data with partners",
          placeholder: "Help improve our service",
          render: "checkbox",
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByTestId("checkbox-share-data");
    expect(checkbox).toHaveAttribute("data-state", "unchecked");
  },
};

/**
 * Checkbox field with default true value (E2E: verify default state and toggle)
 */
export const WithDefaultValueTrue: Story = {
  args: {
    schemas: [
      z.object({
        subscribeToNewsletter: field(z.boolean().default(true), {
          label: "Subscribe to Newsletter",
          placeholder: "Receive email updates",
          render: "checkbox",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByTestId("checkbox-subscribe-to-newsletter");
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    await step("verify initial value is true", () => {
      expect(checkbox).toHaveAttribute("data-state", "checked");
    });
    await step("submit form with initial value", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify submitted data matches initial value", () => {
      expect(submittedData).toContainHTML(stringify({ subscribeToNewsletter: true }, true));
    });
  },
};

/**
 * Disabled checkbox field with true value
 */
export const DisabledTrue: Story = {
  args: {
    initialData: { verified: true },
    schemas: [
      z.object({
        verified: field(z.boolean(), {
          label: "Account Verified",
          placeholder: "Your account status",
          render: "checkbox",
          state: "disabled",
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByTestId("checkbox-verified");
    expect(checkbox).toBeDisabled();
    expect(checkbox).toHaveAttribute("data-state", "checked");
  },
};

/**
 * Disabled checkbox field with false value
 */
export const DisabledFalse: Story = {
  args: {
    initialData: { suspended: false },
    schemas: [
      z.object({
        suspended: field(z.boolean(), {
          label: "Account Suspended",
          placeholder: "Your account status",
          render: "checkbox",
          state: "disabled",
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByTestId("checkbox-suspended");
    expect(checkbox).toBeDisabled();
    expect(checkbox).toHaveAttribute("data-state", "unchecked");
  },
};

/**
 * Multiple checkbox fields
 */
export const MultipleFields: Story = {
  args: {
    schemas: [
      z.object({
        acceptCookies: field(z.boolean(), {
          label: "Accept Cookies",
          placeholder: "Enable cookies for better experience",
          render: "checkbox",
        }),
        marketingEmails: field(z.boolean().optional(), {
          label: "Marketing Emails",
          placeholder: "Receive promotional offers",
          render: "checkbox",
        }),
        rememberMe: field(z.boolean(), {
          label: "Remember Me",
          placeholder: "Keep me logged in",
          render: "checkbox",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    await step("toggle acceptCookies to true", async () => {
      const acceptCookies = canvas.getByTestId("checkbox-accept-cookies");
      await userEvent.click(acceptCookies);
      expect(acceptCookies).toHaveAttribute("data-state", "checked");
    });
    await step("toggle rememberMe to true", async () => {
      const rememberMe = canvas.getByTestId("checkbox-remember-me");
      await userEvent.click(rememberMe);
      expect(rememberMe).toHaveAttribute("data-state", "checked");
    });
    await step("submit form", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify submitted data", () => {
      const expectedData = {
        acceptCookies: true,
        rememberMe: true,
      };
      expect(submittedData).toContainHTML(stringify(expectedData, true));
    });
  },
};
