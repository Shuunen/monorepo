import { isBrowserEnvironment, Logger, stringify } from "@monorepo/utils";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { invariant } from "es-toolkit";
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
        agreedToTerms: field(z.literal(true, "Please accept to continue"), {
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
      await expect(submittedData).toContainHTML("{}");
    });
    await step("toggle switch to true and submit", async () => {
      await userEvent.click(toggleSwitch);
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
      await expect(submittedData).toContainHTML(stringify({ agreedToTerms: true }, true));
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

    await step("verify initial value is true", async () => {
      await expect(toggleSwitch).toHaveAttribute("aria-checked", "true");
    });

    await step("submit form with initial value", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });

    await step("verify submitted data matches initial value", async () => {
      await expect(submittedData).toContainHTML(stringify({ enableNotifications: true }, true));
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggleSwitch = canvas.getByRole("switch");
    await expect(toggleSwitch).toHaveAttribute("aria-checked", "false");
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

    await step("verify initial value is true", async () => {
      await expect(toggleSwitch).toHaveAttribute("aria-checked", "true");
    });

    await step("submit form with initial value", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });

    await step("verify submitted data matches initial value", async () => {
      await expect(submittedData).toContainHTML(stringify({ subscribeToNewsletter: true }, true));
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

    await step("verify initial value is false", async () => {
      await expect(toggleSwitch).toHaveAttribute("aria-checked", "false");
    });

    await step("submit form with initial value", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });

    await step("verify that we have no errors on submit", async () => {
      const issues = canvas.queryAllByRole("alert");
      expect(issues.map(el => el.textContent).join(",")).toBe("");
      const expectedData = stringify({ subscribeToNewsletter: false }, true);
      await expect(submittedData).toContainHTML(expectedData);
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole("button", { name: "Submit" });
    await expect(submitButton).not.toBeDisabled();
  },
};

/**
 * Optional boolean field
 */
export const OptionalWithPrefault: Story = {
  args: {
    schemas: [
      z.object({
        subscribe: field(z.boolean().prefault(false).optional(), {
          label: "Subscribe to newsletter",
          placeholder: "Optional subscription",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const submittedData = canvas.getByTestId("debug-data-submitted-data");

    await step("submit form with prefault value", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });

    await step("verify prefault value is included in submitted data", async () => {
      await expect(submittedData).toContainHTML(stringify({ subscribe: false }, true));
    });
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggleSwitch = canvas.getByRole("switch");
    await expect(toggleSwitch).toBeDisabled();
    await expect(toggleSwitch).toHaveAttribute("aria-checked", "true");
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggleSwitch = canvas.getByRole("switch");
    await expect(toggleSwitch).toBeDisabled();
    await expect(toggleSwitch).toHaveAttribute("aria-checked", "false");
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
      invariant(switches[0], "Accept Cookies switch not found");
      await userEvent.click(switches[0]);
      await expect(switches[0]).toHaveAttribute("aria-checked", "true");
    });
    await step("toggle rememberMe to true", async () => {
      invariant(switches[2], "Remember Me switch not found");
      await userEvent.click(switches[2]);
      await expect(switches[2]).toHaveAttribute("aria-checked", "true");
    });
    await step("submit form", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify submitted data", async () => {
      const expectedData = {
        acceptCookies: true,
        rememberMe: true,
      };
      await expect(submittedData).toContainHTML(stringify(expectedData, true));
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
        agreedToTerms: field(z.literal(true, "Conditions need to be accepted."), {
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
    await expect(checkbox).toBeInTheDocument();
    await step("submit without checking should not submit", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
      await expect(submittedData).toContainHTML("{}");
    });
    await step("check checkbox and submit", async () => {
      await userEvent.click(checkbox);
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
      await expect(submittedData).toContainHTML(stringify({ agreedToTerms: true }, true));
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
    await step("verify initial value is true", async () => {
      await expect(checkbox).toHaveAttribute("data-state", "checked");
    });
    await step("submit form with initial value", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify submitted data matches initial value", async () => {
      await expect(submittedData).toContainHTML(stringify({ enableNotifications: true }, true));
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByTestId("checkbox-share-data");
    await expect(checkbox).toHaveAttribute("data-state", "unchecked");
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
    await step("verify initial value is true", async () => {
      await expect(checkbox).toHaveAttribute("data-state", "checked");
    });
    await step("submit form with initial value", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify submitted data matches initial value", async () => {
      await expect(submittedData).toContainHTML(stringify({ subscribeToNewsletter: true }, true));
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByTestId("checkbox-verified");
    await expect(checkbox).toBeDisabled();
    await expect(checkbox).toHaveAttribute("data-state", "checked");
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByTestId("checkbox-suspended");
    await expect(checkbox).toBeDisabled();
    await expect(checkbox).toHaveAttribute("data-state", "unchecked");
  },
};

/**
 * Multiple checkbox fields
 */
export const CheckboxMultipleFields: Story = {
  args: {
    schemas: [
      z.object({
        requiredTrue: field(z.boolean(), {
          label: "This one is required, could be true or false",
          render: "checkbox",
        }),
        requiredFalse: field(z.boolean(), {
          label: "This one is also required, could be true or false",
          render: "checkbox",
        }),
        booleanOptional: field(z.boolean().optional(), {
          label: "This one is optional, undefined by default",
          render: "checkbox",
        }),
        literalTrue: field(z.literal(true, "Please check this one"), {
          label: "This one needs to be checked",
          render: "checkbox",
        }),
        literalFalse: field(z.literal(false, "Please don't check this one"), {
          label: "This one needs to be un-checked",
          render: "checkbox",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    const submitButton = canvas.getByRole("button", { name: "Submit" });
    const requiredTrue = canvas.getByTestId("checkbox-required-true");
    const literalTrue = canvas.getByTestId("checkbox-literal-true");
    const literalFalse = canvas.getByTestId("checkbox-literal-false");
    await step("submit form", async () => {
      await userEvent.click(submitButton);
      const expectedData = {};
      await expect(submittedData).toContainHTML(stringify(expectedData, true));
      const issues = canvas.queryAllByRole("alert");
      await expect(issues.map(el => el.textContent).join(",")).toBe("Please check this one");
    });
    await step("play with literals", async () => {
      await userEvent.click(literalTrue);
      await userEvent.click(literalFalse);
      const issues = canvas.queryAllByRole("alert");
      await expect(issues.map(el => el.textContent).join(",")).toBe("Please don't check this one");
    });
    await step("fix issues and submit", async () => {
      await userEvent.click(literalFalse);
      await userEvent.click(requiredTrue);
      const issues = canvas.queryAllByRole("alert");
      await expect(issues.map(el => el.textContent).join(",")).toBe("");
      await userEvent.click(submitButton);
      const expectedData = {
        requiredTrue: true, // true because we checked it
        requiredFalse: false, // false because we automagically init it to false
        literalTrue: true, // true because true in the schema and only possible to be true
        literalFalse: false, // false because false in the schema and only possible to be false
      };
      await expect(submittedData).toContainHTML(stringify(expectedData, true));
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
      await expect(issues.map(el => el.textContent).join(",")).toBe("Please select at least one newsletter");
      await expect(submittedData).toContainHTML("{}");
    });
    await step("select one checkbox and submit should succeed", async () => {
      const recommendations = canvas.getByTestId("checkbox-newsletter-recommendations");
      await userEvent.click(recommendations);
      await userEvent.click(submitButton);
      await expect(submittedData).toContainHTML(stringify({ newsletterRecommendations: true }, true));
    });
  },
};
