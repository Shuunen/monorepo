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
  title: "Commons/Molecules/FormFieldSelect",
} satisfies Meta<typeof AutoForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic select with simple enum values
 */
export const Basic: Story = {
  args: {
    schemas: [
      z.object({
        color: field(z.enum(["red", "green", "blue"]), {
          label: "Favorite Color",
          placeholder: "Choose a color",
        }),
      }),
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const canvasBody = within(canvasElement.ownerDocument.body);
    const colorTrigger = canvas.getByTestId("button-color");
    await userEvent.click(colorTrigger);
    const colorListbox = canvasBody.getByTestId("select-options-color");
    const colorOptions = within(colorListbox).getAllByRole("option");
    expect(colorOptions[0]).toHaveTextContent("Red");
    expect(colorOptions[1]).toHaveTextContent("Green");
    expect(colorOptions[2]).toHaveTextContent("Blue");
  },
};

/**
 * Enum fields with custom labels demonstrating automatic label generation.
 * Note: The enum values are lowercase, but the labels are automatically capitalized.
 * Multi-word enum values like 'extra-large' are formatted as 'Extra-large'.
 */
export const LabelGeneration: Story = {
  args: {
    schemas: [
      z.object({
        color: field(z.enum(["red", "green", "blue"]), {
          label: "Favorite Color",
          placeholder: "Choose a color",
        }),
        priority: field(z.enum(["low", "medium", "high", "critical"]), {
          label: "Priority Level",
          placeholder: "Select priority",
        }),
        size: field(z.enum(["small", "medium", "large", "extra-large"]), {
          label: "T-shirt Size",
          placeholder: "Select your size",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const canvasBody = within(canvasElement.ownerDocument.body);
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    await step("select color option", async () => {
      const colorTrigger = canvas.getByTestId("button-color");
      await userEvent.click(colorTrigger);
      const colorListbox = canvasBody.getByTestId("select-options-color");
      const colorOptions = within(colorListbox).getAllByRole("option");
      expect(colorOptions[0]).toHaveTextContent("Red");
      expect(colorOptions[1]).toHaveTextContent("Green");
      expect(colorOptions[2]).toHaveTextContent("Blue");
      await userEvent.click(colorOptions[1]);
      expect(colorTrigger).toHaveTextContent("Green");
    });
    await step("select size option", async () => {
      const sizeTrigger = canvas.getByTestId("button-size");
      await userEvent.click(sizeTrigger);
      const sizeListbox = canvasBody.getByTestId("select-options-size");
      const sizeOptions = within(sizeListbox).getAllByRole("option");
      expect(sizeOptions[0]).toHaveTextContent("Small");
      expect(sizeOptions[1]).toHaveTextContent("Medium");
      expect(sizeOptions[2]).toHaveTextContent("Large");
      expect(sizeOptions[3]).toHaveTextContent("Extra-large");
      await userEvent.click(sizeOptions[2]);
      expect(sizeTrigger).toHaveTextContent("Large");
    });
    await step("select priority option", async () => {
      const priorityTrigger = canvas.getByTestId("button-priority");
      await userEvent.click(priorityTrigger);
      const priorityListbox = canvasBody.getByTestId("select-options-priority");
      const priorityOptions = within(priorityListbox).getAllByRole("option");
      expect(priorityOptions[0]).toHaveTextContent("Low");
      expect(priorityOptions[1]).toHaveTextContent("Medium");
      expect(priorityOptions[2]).toHaveTextContent("High");
      expect(priorityOptions[3]).toHaveTextContent("Critical");
      await userEvent.click(priorityOptions[3]);
      expect(priorityTrigger).toHaveTextContent("Critical");
    });
    await step("submit form", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify submitted data", () => {
      const expectedData = {
        color: "green",
        priority: "critical",
        size: "large",
      };
      expect(submittedData).toContainHTML(stringify(expectedData, true));
    });
  },
};

/**
 * Select with prefault value (E2E: verify default value initialization and submit)
 */
export const WithPrefault: Story = {
  args: {
    schemas: [
      z.object({
        color: field(z.enum(["red", "green", "blue"]).prefault("blue"), {
          label: "Favorite Color",
          placeholder: "Choose a color",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    const colorTrigger = canvas.getByTestId("button-color");

    await step("verify prefault value is displayed", () => {
      expect(colorTrigger).toHaveTextContent("Blue");
    });

    await step("submit form with prefault value", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });

    await step("verify submitted data matches prefault value", () => {
      expect(submittedData).toContainHTML(stringify({ color: "blue" }, true));
    });
  },
};

/**
 * Optional select field
 */
export const Optional: Story = {
  args: {
    schemas: [
      z.object({
        color: field(z.enum(["red", "green", "blue"]).optional(), {
          label: "Optional Color",
          placeholder: "Choose a color",
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
 * Disabled select field
 */
export const Disabled: Story = {
  args: {
    initialData: { color: "green" },
    schemas: [
      z.object({
        color: field(z.enum(["red", "green", "blue"]), {
          label: "Disabled Color",
          placeholder: "Choose a color",
          state: "disabled",
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const colorTrigger = canvas.getByTestId("button-color");
    expect(colorTrigger).toBeDisabled();
    expect(colorTrigger).toHaveTextContent("Green");
  },
};

/**
 * Readonly select field
 */
export const Readonly: Story = {
  args: {
    initialData: { color: "blue" },
    schemas: [
      z.object({
        color: field(z.enum(["red", "green", "blue"]), {
          label: "Readonly Color",
          placeholder: "Choose a color",
          state: "readonly",
        }),
      }),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const colorTrigger = canvas.getByTestId("button-color");
    expect(colorTrigger).toHaveTextContent("Blue");
  },
};

/**
 * Custom label/value pairs for select options
 */
export const CustomLabels: Story = {
  args: {
    schemas: [
      z.object({
        country: field(z.enum(["us", "uk", "fr", "de", "jp"]), {
          label: "Country",
          options: [
            { label: "🇺🇸 United States", value: "us" },
            { label: "🇬🇧 United Kingdom", value: "uk" },
            { label: "🇫🇷 France", value: "fr" },
            { label: "🇩🇪 Germany", value: "de" },
            { label: "🇯🇵 Japan", value: "jp" },
          ],
          placeholder: "Select your country",
        }),
        size: field(z.enum(["xs", "sm", "md", "lg", "xl"]), {
          label: "Size",
          options: [
            { label: "Extra Small (XS)", value: "xs" },
            { label: "Small (S)", value: "sm" },
            { label: "Medium (M)", value: "md" },
            { label: "Large (L)", value: "lg" },
            { label: "Extra Large (XL)", value: "xl" },
          ],
          placeholder: "Select your size",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const canvasBody = within(canvasElement.ownerDocument.body);
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    await step("select country option", async () => {
      const countryTrigger = canvas.getByTestId("button-country");
      await userEvent.click(countryTrigger);
      const countryListbox = canvasBody.getByTestId("select-options-country");
      const countryOptions = within(countryListbox).getAllByRole("option");
      expect(countryOptions[0]).toHaveTextContent("🇺🇸 United States");
      expect(countryOptions[1]).toHaveTextContent("🇬🇧 United Kingdom");
      expect(countryOptions[2]).toHaveTextContent("🇫🇷 France");
      await userEvent.click(countryOptions[2]);
      expect(countryTrigger).toHaveTextContent("🇫🇷 France");
    });
    await step("select size option", async () => {
      const sizeTrigger = canvas.getByTestId("button-size");
      await userEvent.click(sizeTrigger);
      const sizeListbox = canvasBody.getByTestId("select-options-size");
      const sizeOptions = within(sizeListbox).getAllByRole("option");
      expect(sizeOptions[0]).toHaveTextContent("Extra Small (XS)");
      expect(sizeOptions[2]).toHaveTextContent("Medium (M)");
      expect(sizeOptions[4]).toHaveTextContent("Extra Large (XL)");
      await userEvent.click(sizeOptions[3]);
      expect(sizeTrigger).toHaveTextContent("Large (L)");
    });
    await step("submit form", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify submitted data", () => {
      const expectedData = {
        country: "fr",
        size: "lg",
      };
      expect(submittedData).toContainHTML(stringify(expectedData, true));
    });
  },
};

/**
 * Performance test for select field
 */
export const Perf: Story = {
  args: {
    schemas: [
      z.object({
        numbers: field(z.enum(Array.from({ length: 1000 }, (_, i) => i.toString())), {
          label: "Numbers",
          placeholder: "Choose a number",
        }),
      }),
    ],
  },
};
