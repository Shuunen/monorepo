import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Input } from "./input";

const meta = {
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "Commons/Atoms/Input",
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "default",
    placeholder: "Enter text here",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByTestId("input-text-default") as HTMLInputElement;

    // Renders with correct placeholder
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("placeholder", "Enter text here");
    expect(input.value).toBe("");

    // Typing should update the value
    await userEvent.type(input, "Hello world", { delay: 40 });
    expect(input.value).toBe("Hello world");
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    name: "disabled",
    placeholder: "Disabled input",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByTestId("input-text-disabled") as HTMLInputElement;

    // Renders disabled with correct placeholder
    expect(input).toBeInTheDocument();
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("placeholder", "Disabled input");

    // Typing should NOT change the value
    await userEvent.type(input, "Trying to type", { delay: 40 });
    expect(input.value).toBe("");
  },
};

export const Readonly: Story = {
  args: {
    defaultValue: "Initial value",
    name: "readonly",
    placeholder: "Readonly input",
    readOnly: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByTestId("input-text-readonly") as HTMLInputElement;

    // Renders readonly with correct placeholder & initial value
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("placeholder", "Readonly input");
    expect(input).toHaveAttribute("readonly");
    expect(input.value).toBe("Initial value");

    // Typing should NOT change the value
    await userEvent.type(input, " - edited", { delay: 40 });
    expect(input.value).toBe("Initial value");
  },
};
