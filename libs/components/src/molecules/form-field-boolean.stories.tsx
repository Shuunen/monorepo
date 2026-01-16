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
  title: "Commons/Molecules/FormFieldBoolean",
} satisfies Meta<typeof AutoForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic boolean field with switch
 */
export const Basic: Story = {
  args: {
    schemas: [
      z.object({
        agreedToTerms: field(z.boolean(), {
          label: "I agree to the Terms and Conditions",
          placeholder: "Please accept the terms",
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggleSwitch = canvas.getByRole("switch");
    expect(toggleSwitch).toBeInTheDocument();
  },
};

/**
 * Boolean field with initial true value (E2E: verify initial state and toggle)
 */
export const WithInitialValueTrue: Story = {
  args: {
    initialData: { enableNotifications: true },
    schemas: [
      z.object({
        enableNotifications: field(z.boolean(), {
          label: "Enable Email Notifications",
          placeholder: "Receive email updates",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const toggleSwitch = canvas.getByRole("switch");
    const submittedData = canvas.getByTestId("debug-data-submitted-data");

    await step("verify initial value is true", () => {
      expect(toggleSwitch).toHaveAttribute("aria-checked", "true");
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
 * Boolean field with initial false value
 */
export const WithInitialValueFalse: Story = {
  args: {
    initialData: { shareData: false },
    schemas: [
      z.object({
        shareData: field(z.boolean(), {
          label: "Share anonymized data with partners",
          placeholder: "Help improve our service",
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggleSwitch = canvas.getByRole("switch");
    expect(toggleSwitch).toHaveAttribute("aria-checked", "false");
  },
};

/**
 * Optional boolean field
 */
export const Optional: Story = {
  args: {
    schemas: [
      z.object({
        subscribe: field(z.boolean().optional(), {
          label: "Subscribe to newsletter",
          placeholder: "Optional subscription",
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
 * Disabled boolean field with true value
 */
export const DisabledTrue: Story = {
  args: {
    initialData: { verified: true },
    schemas: [
      z.object({
        verified: field(z.boolean(), {
          label: "Account Verified",
          placeholder: "Your account status",
          state: "disabled",
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggleSwitch = canvas.getByRole("switch");
    expect(toggleSwitch).toBeDisabled();
    expect(toggleSwitch).toHaveAttribute("aria-checked", "true");
  },
};

/**
 * Disabled boolean field with false value
 */
export const DisabledFalse: Story = {
  args: {
    initialData: { suspended: false },
    schemas: [
      z.object({
        suspended: field(z.boolean(), {
          label: "Account Suspended",
          placeholder: "Your account status",
          state: "disabled",
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggleSwitch = canvas.getByRole("switch");
    expect(toggleSwitch).toBeDisabled();
    expect(toggleSwitch).toHaveAttribute("aria-checked", "false");
  },
};

/**
 * Multiple boolean fields
 */
export const MultipleFields: Story = {
  args: {
    schemas: [
      z.object({
        acceptCookies: field(z.boolean(), {
          label: "Accept Cookies",
          placeholder: "Enable cookies for better experience",
        }),
        marketingEmails: field(z.boolean().optional(), {
          label: "Marketing Emails",
          placeholder: "Receive promotional offers",
        }),
        rememberMe: field(z.boolean(), {
          label: "Remember Me",
          placeholder: "Keep me logged in",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const switches = canvas.getAllByRole("switch");
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    await step("toggle acceptCookies to true", async () => {
      await userEvent.click(switches[0]);
      expect(switches[0]).toHaveAttribute("aria-checked", "true");
    });
    await step("toggle rememberMe to true", async () => {
      await userEvent.click(switches[2]);
      expect(switches[2]).toHaveAttribute("aria-checked", "true");
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

/**
 * Boolean literal field (always true, cannot be changed)
 */
export const BooleanLiteral: Story = {
  args: {
    schemas: [
      z.object({
        isPublished: field(z.literal(true), {
          label: "Published",
          placeholder: "This item is published",
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggleSwitch = canvas.getByRole("switch");
    expect(toggleSwitch).toBeDisabled();
    expect(toggleSwitch).toHaveAttribute("aria-checked", "true");
  },
};
