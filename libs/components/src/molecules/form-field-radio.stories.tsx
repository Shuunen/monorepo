import { isBrowserEnvironment, Logger, stringify } from "@monorepo/utils";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { z } from "zod";
import { AutoForm } from "./auto-form";
import { field } from "./auto-form.utils";
import { DebugData } from "./debug-data";
import type { AutoFormData } from "./auto-form.types";

const logger = new Logger({ minimumLevel: isBrowserEnvironment() ? "3-info" : "5-warn" });

const meta = {
  component: AutoForm,
  parameters: {
    layout: "centered",
  },
  render: args => {
    const [submittedData, setSubmittedData] = useState<AutoFormData>({});
    function onSubmit(data: AutoFormData) {
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
  title: "Commons/Molecules/FormFieldRadio",
} satisfies Meta<typeof AutoForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic radio group with simple enum values (E2E: select option, submit, verify)
 */
export const Basic: Story = {
  args: {
    schemas: [
      z.object({
        color: field(z.enum(["red", "green", "blue"]), {
          label: "Favourite Color",
          render: "radio",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    const radios = canvas.getAllByRole("radio");
    expect(radios).toHaveLength(3);

    await step("select green option", async () => {
      const greenLabel = canvas.getByText("Green");
      await userEvent.click(greenLabel);
      const greenRadio = canvas.getByRole("radio", { name: /green/i });
      expect(greenRadio).toHaveAttribute("data-state", "checked");
    });

    await step("submit form", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });

    await step("verify submitted data", () => {
      expect(submittedData).toContainHTML(stringify({ color: "green" }, true));
    });
  },
};

/**
 * Radio group with custom labels via options
 */
export const CustomLabels: Story = {
  args: {
    schemas: [
      z.object({
        priority: field(z.enum(["low", "medium", "high"]), {
          label: "Priority Level",
          placeholder: "Select the priority level based on your requirements",
          options: [
            { label: "Low Priority", value: "low" },
            { label: "Medium Priority", value: "medium" },
            { label: "High Priority", value: "high" },
          ],
          render: "radio",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const submittedData = canvas.getByTestId("debug-data-submitted-data");

    await step("verify custom labels are displayed", () => {
      expect(canvas.getByText("Low Priority")).toBeInTheDocument();
      expect(canvas.getByText("Medium Priority")).toBeInTheDocument();
      expect(canvas.getByText("High Priority")).toBeInTheDocument();
    });

    await step("select high priority", async () => {
      await userEvent.click(canvas.getByText("High Priority"));
      const highRadio = canvas.getByRole("radio", { name: /high priority/i });
      expect(highRadio).toHaveAttribute("data-state", "checked");
    });

    await step("submit form", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });

    await step("verify submitted data", () => {
      expect(submittedData).toContainHTML(stringify({ priority: "high" }, true));
    });
  },
};

/**
 * Radio group with initial value (E2E: verify initial state and submit)
 */
export const WithInitialValue: Story = {
  args: {
    initialData: { size: "medium" },
    schemas: [
      z.object({
        size: field(z.enum(["small", "medium", "large"]), {
          label: "T-shirt Size",
          render: "radio",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const submittedData = canvas.getByTestId("debug-data-submitted-data");

    await step("verify initial value is selected", () => {
      const mediumRadio = canvas.getByRole("radio", { name: /medium/i });
      expect(mediumRadio).toHaveAttribute("data-state", "checked");
    });

    await step("submit form with initial value", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });

    await step("verify submitted data matches initial value", () => {
      expect(submittedData).toContainHTML(stringify({ size: "medium" }, true));
    });
  },
};

/**
 * Optional radio group
 */
export const Optional: Story = {
  args: {
    schemas: [
      z.object({
        theme: field(z.enum(["light", "dark", "system"]).optional(), {
          label: "Theme Preference",
          render: "radio",
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole("button", { name: "Submit" });
    expect(submitButton).not.toBeDisabled();
    const radios = canvas.getAllByRole("radio");
    expect(radios).toHaveLength(3);
  },
};

/**
 * Disabled radio group
 */
export const Disabled: Story = {
  args: {
    initialData: { status: "active" },
    schemas: [
      z.object({
        status: field(z.enum(["active", "inactive", "pending"]), {
          label: "Account Status",
          render: "radio",
          state: "disabled",
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radios = canvas.getAllByRole("radio");
    for (const radio of radios) {
      expect(radio).toBeDisabled();
    }
    const activeRadioButton = canvas.getByTestId("radio-item-status-active-active");
    const activeRadio = activeRadioButton.nextElementSibling;
    expect(activeRadio).toBeChecked();
  },
};

/**
 * Readonly radio group
 */
export const Readonly: Story = {
  args: {
    initialData: { plan: "pro" },
    schemas: [
      z.object({
        plan: field(z.enum(["free", "pro", "enterprise"]), {
          label: "Subscription Plan",
          render: "radio",
          state: "readonly",
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radios = canvas.getAllByRole("radio");
    for (const radio of radios) {
      expect(radio).toBeDisabled();
    }
    const proRadio = canvas.getByRole("radio", { name: /pro/i });
    expect(proRadio).toHaveAttribute("data-state", "checked");
  },
};

/**
 * Multiple radio groups in the same form
 */
export const MultipleFields: Story = {
  args: {
    schemas: [
      z.object({
        color: field(z.enum(["red", "green", "blue"]), {
          label: "Favourite Color",
          render: "radio",
        }),
        size: field(z.enum(["small", "medium", "large"]), {
          label: "Size",
          render: "radio",
          // isInvalid: (data: Record<string, unknown>) => {
          //   if (data.color === "red" && data.size === "large") {
          //     return "Cant choose large size if color is red";
          //   }
          //   return undefined;
          // },
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    const radios = canvas.getAllByRole("radio");
    expect(radios).toHaveLength(6);

    await step("select color", async () => {
      const blueLabel = canvas.getByText("Blue");
      await userEvent.click(blueLabel);
    });

    await step("select size", async () => {
      const largeLabel = canvas.getByText("Large");
      await userEvent.click(largeLabel);
    });

    await step("submit form", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });

    await step("verify submitted data", () => {
      expect(submittedData).toContainHTML(stringify({ color: "blue", size: "large" }, true));
    });
  },
};
