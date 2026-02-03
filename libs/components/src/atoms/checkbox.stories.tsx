import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Checkbox } from "./checkbox";

const meta = {
  argTypes: {
    disabled: {
      control: "boolean",
    },
  },
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "Commons/Atoms/Checkbox",
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "default",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox");

    // Should render
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();

    // Clicking should toggle
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  },
};

export const Checked: Story = {
  args: {
    defaultChecked: true,
    name: "checked",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox");

    expect(checkbox).toBeChecked();

    await userEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    name: "disabled",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox");

    expect(checkbox).toBeDisabled();

    // Clicking should do nothing
    await userEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  },
};

export const DisabledChecked: Story = {
  args: {
    defaultChecked: true,
    disabled: true,
    name: "disabled-checked",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox");

    expect(checkbox).toBeChecked();
    expect(checkbox).toBeDisabled();

    // Clicking should NOT uncheck
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  },
};

export const WithLabel: Story = {
  args: {
    name: "with-label",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const checkbox = canvas.getByRole("checkbox");
    const label = canvas.getByText("Accept terms and conditions");

    expect(checkbox).toBeInTheDocument();
    expect(label).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();

    // Clicking label should toggle checkbox
    await userEvent.click(label);
    expect(checkbox).toBeChecked();

    // Clicking label again should uncheck
    await userEvent.click(label);
    expect(checkbox).not.toBeChecked();
  },
  render: () => {
    const id = useId();
    return (
      <div className="flex items-center space-x-2">
        <Checkbox id={id} name="with-label" />
        <label
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          htmlFor={id}
        >
          Accept terms and conditions
        </label>
      </div>
    );
  },
};
