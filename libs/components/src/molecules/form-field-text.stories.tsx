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
  title: "Commons/Molecules/FormFieldText",
} satisfies Meta<typeof AutoForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic text field (E2E: fill, submit, verify string output)
 */
export const Basic: Story = {
  args: {
    schemas: [
      z.object({
        username: field(z.string(), {
          label: "Username",
          placeholder: "Enter your username",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const textInput = canvas.getByTestId("input-text-username") as HTMLInputElement;
    const submittedData = canvas.getByTestId("debug-data-submitted-data");

    expect(textInput).toBeInTheDocument();

    await step("fill text input", async () => {
      await userEvent.clear(textInput);
      await userEvent.type(textInput, "john_doe");
      expect(textInput).toHaveValue("john_doe");
    });

    await step("submit form", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });

    await step("verify submitted data contains string", () => {
      expect(submittedData).toContainHTML(stringify({ username: "john_doe" }, true));
    });
  },
};

/**
 * Text field with initial value (E2E: verify initial display and submit)
 */
export const WithInitialValue: Story = {
  args: {
    initialData: { name: "Alice" },
    schemas: [
      z.object({
        name: field(z.string(), {
          label: "Full Name",
          placeholder: "Enter your name",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const textInput = canvas.getByTestId("input-text-name") as HTMLInputElement;
    const submittedData = canvas.getByTestId("debug-data-submitted-data");

    await step("verify initial value is displayed", () => {
      expect(textInput).toHaveValue("Alice");
    });

    await step("submit form with initial value", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });

    await step("verify submitted data matches initial value", () => {
      expect(submittedData).toContainHTML(stringify({ name: "Alice" }, true));
    });
  },
};

/**
 * Optional text field
 */
export const Optional: Story = {
  args: {
    schemas: [
      z.object({
        nickname: field(z.string().optional(), {
          label: "Nickname",
          placeholder: "Enter an optional nickname",
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
 * Disabled text field
 */
export const Disabled: Story = {
  args: {
    initialData: { email: "user@example.com" },
    schemas: [
      z.object({
        email: field(z.string(), {
          label: "Email Address",
          placeholder: "your@email.com",
          state: "disabled",
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const emailInput = canvas.getByTestId("input-text-email") as HTMLInputElement;
    expect(emailInput).toBeDisabled();
    expect(emailInput).toHaveValue("user@example.com");
  },
};

/**
 * Readonly text field
 */
export const Readonly: Story = {
  args: {
    initialData: { accountId: "ACC-12345" },
    schemas: [
      z.object({
        accountId: field(z.string(), {
          label: "Account ID",
          placeholder: "Your account ID",
          state: "readonly",
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const accountIdInput = canvas.getByTestId("input-text-account-id") as HTMLInputElement;
    expect(accountIdInput).toHaveAttribute("readonly");
    expect(accountIdInput).toHaveValue("ACC-12345");
  },
};

/**
 * Multiple text fields with different constraints
 */
export const MultipleFields: Story = {
  args: {
    schemas: [
      z.object({
        firstName: field(z.string(), {
          label: "First Name",
          placeholder: "Enter first name",
        }),
        lastName: field(z.string(), {
          label: "Last Name",
          placeholder: "Enter last name",
        }),
        phone: field(z.string().optional(), {
          label: "Phone Number",
          placeholder: "Optional: enter phone number",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const firstNameInput = canvas.getByTestId("input-text-first-name") as HTMLInputElement;
    const lastNameInput = canvas.getByTestId("input-text-last-name") as HTMLInputElement;
    const submittedData = canvas.getByTestId("debug-data-submitted-data");

    await step("fill first name", async () => {
      await userEvent.type(firstNameInput, "John");
      expect(firstNameInput).toHaveValue("John");
    });

    await step("fill last name", async () => {
      await userEvent.type(lastNameInput, "Smith");
      expect(lastNameInput).toHaveValue("Smith");
    });

    await step("submit form", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });

    await step("verify submitted data", () => {
      const expectedData = {
        firstName: "John",
        lastName: "Smith",
      };
      expect(submittedData).toContainHTML(stringify(expectedData, true));
    });
  },
};

export const DontAllowEmptyValue: Story = {
  args: {
    schemas: [
      z.object({
        username: field(z.string(), {
          label: "Username",
          placeholder: "Enter your username",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const usernameInput = canvas.getByTestId("input-text-username") as HTMLInputElement;
    const submittedData = canvas.getByTestId("debug-data-submitted-data");

    await step("fill username with spaces and submit", async () => {
      await userEvent.type(usernameInput, "     ");
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
      expect(submittedData).toContainHTML(stringify({}, true));
    });

    await step("fill username with username", async () => {
      await userEvent.type(usernameInput, "john_doe");
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
      expect(submittedData).toContainHTML(stringify({ username: "john_doe" }, true));
    });
  },
};
