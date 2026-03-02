import { isBrowserEnvironment, Logger, stringify } from "@monorepo/utils";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { z } from "zod";
import { AutoForm } from "./auto-form";
import { field, section } from "./auto-form.utils";
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
 * Basic boolean field with switch - required boolean must be set to true to submit
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const toggleSwitch = canvas.getByRole("switch");
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    expect(toggleSwitch).toBeInTheDocument();
    await step("submit without toggling should not submit", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
      expect(submittedData).toContainHTML("{}");
    });
    await step("toggle switch to true and submit", async () => {
      await userEvent.click(toggleSwitch);
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
      expect(submittedData).toContainHTML(stringify({ agreedToTerms: true }, true));
    });
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
 * Boolean field with default true value (E2E: verify default state and toggle)
 */
export const WithDefaultValueTrue: Story = {
  args: {
    schemas: [
      z.object({
        subscribeToNewsletter: field(z.boolean().default(true), {
          label: "Subscribe to Newsletter",
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
      expect(submittedData).toContainHTML(stringify({ subscribeToNewsletter: true }, true));
    });
  },
};

/**
 * Boolean field with default false value (E2E: verify default state and toggle)
 */
export const WithDefaultValueFalse: Story = {
  args: {
    schemas: [
      z.object({
        subscribeToNewsletter: field(z.boolean().default(false), {
          label: "Subscribe to Newsletter",
          placeholder: "Receive email updates",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const toggleSwitch = canvas.getByRole("switch");
    const submittedData = canvas.getByTestId("debug-data-submitted-data");

    await step("verify initial value is false", () => {
      expect(toggleSwitch).toHaveAttribute("aria-checked", "false");
    });

    await step("submit form with initial value", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });

    await step("verify that we have errors on submit", () => {
      const issues = canvas.queryAllByRole("alert");
      expect(issues.map(el => el.textContent).join(",")).toBe("This field is required");
      expect(submittedData).toContainHTML("{}");
    });
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
 * Basic checkbox field rendered with render: "checkbox" - required boolean must be checked to submit
 */
export const CheckboxBasic: Story = {
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByTestId("checkbox-agreed-to-terms");
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    expect(checkbox).toBeInTheDocument();
    await step("submit without checking should not submit", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
      expect(submittedData).toContainHTML("{}");
    });
    await step("check checkbox and submit", async () => {
      await userEvent.click(checkbox);
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
      expect(submittedData).toContainHTML(stringify({ agreedToTerms: true }, true));
    });
  },
};

/**
 * Checkbox field with initial true value (E2E: verify initial state and toggle)
 */
export const CheckboxWithInitialValueTrue: Story = {
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
export const CheckboxWithInitialValueFalse: Story = {
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
export const CheckboxWithDefaultValueTrue: Story = {
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
export const CheckboxDisabledTrue: Story = {
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
export const CheckboxDisabledFalse: Story = {
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
export const CheckboxMultipleFields: Story = {
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

const noNewsletterSelected = (data: Record<string, unknown>) => {
  const { newsletterRecommendations, newsletterUpdates, newsletterOffers } = data;
  return !newsletterRecommendations && !newsletterUpdates && !newsletterOffers;
};

/**
 * Checkbox group
 */
export const CheckboxGroup: Story = {
  args: {
    schemas: [
      z.object({
        newsletterSection: section({
          label: "Select at least one newsletter",
          labelStar: true,
          description: "Choose the newsletters you want to subscribe to.",
        }),
        newsletterRecommendations: field(z.boolean().optional(), {
          label: "Monthly recommendations from the chef",
          errors: data => (noNewsletterSelected(data) ? "" : undefined),
          render: "checkbox",
        }),
        newsletterUpdates: field(z.boolean().optional(), {
          label: "Weekly product updates",
          errors: data => (noNewsletterSelected(data) ? "" : undefined),
          render: "checkbox",
        }),
        newsletterOffers: field(z.boolean().optional(), {
          label: "Exclusive offers and discounts",
          errors: data => (noNewsletterSelected(data) ? "Please select at least one newsletter" : undefined),
          render: "checkbox",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    const submitButton = canvas.getByRole("button", { name: "Submit" });
    await step("submit without selecting should show error", async () => {
      await userEvent.click(submitButton);
      const issues = canvas.queryAllByRole("alert");
      expect(issues.map(el => el.textContent).join(",")).toBe("Please select at least one newsletter");
      expect(submittedData).toContainHTML("{}");
    });
    await step("select one checkbox and submit should succeed", async () => {
      const recommendations = canvas.getByTestId("checkbox-newsletter-recommendations");
      await userEvent.click(recommendations);
      await userEvent.click(submitButton);
      expect(submittedData).toContainHTML(stringify({ newsletterRecommendations: true }, true));
    });
  },
};
