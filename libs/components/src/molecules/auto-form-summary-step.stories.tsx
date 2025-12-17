import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { z } from "zod";
import { field, section, step } from "./auto-form.utils";
import { AutoFormSummaryStep } from "./auto-form-summary-step";

const meta = {
  component: AutoFormSummaryStep,
  parameters: {
    layout: "centered",
  },
  title: "Commons/Molecules/AutoFormSummaryStep",
} satisfies Meta<typeof AutoFormSummaryStep>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: {
    formData: {
      address: "123 Main St, Anytown, USA",
      age: 30,
      email: "john@example.com",
      name: "John Doe",
    },
    schemas: [
      step(
        z.object({
          address: field(z.string().min(1), {
            label: "Address label",
          }),
          age: field(z.number().min(0), {
            label: "Age label",
          }),
          email: field(z.string().email(), {
            label: "Email label",
          }),
          info: section({
            title: "Custom section title",
          }),
          name: field(z.string().min(1), {
            label: "Name label",
          }),
        }),
        {},
      ),
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tableNoSection = canvas.getByTestId("form-summary-no-title");
    expect(tableNoSection).toBeVisible();
    expect(tableNoSection).toHaveTextContent("Address label");
    expect(tableNoSection).toHaveTextContent("123 Main St, Anytown, USA");
    expect(tableNoSection).toHaveTextContent("Age label");
    expect(tableNoSection).toHaveTextContent("30");
    expect(tableNoSection).toHaveTextContent("Email label");
    expect(tableNoSection).toHaveTextContent("john@example.com");
    const sectionTitle = canvas.getByText("Custom section title");
    expect(sectionTitle).toBeVisible();
    const tableWithSection = canvas.getByTestId("form-summary-custom-section-title");
    expect(tableWithSection).toBeVisible();
    expect(tableWithSection).toHaveTextContent("Name label");
    expect(tableWithSection).toHaveTextContent("John Doe");
  },
};

export const Empty: Story = {
  args: {
    formData: {},
    schemas: [],
  },
};
