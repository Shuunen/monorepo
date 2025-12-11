import type { Meta, StoryObj } from "@storybook/react-vite";
// oxlint-disable-next-line no-restricted-imports
import { Bold, Italic } from "lucide-react";
import { expect, userEvent, within } from "storybook/test";
import { Toggle } from "./toggle";

/**
 * A two-state button that can be either on or off.
 */
const meta: Meta<typeof Toggle> = {
  args: {
    "aria-label": "Toggle bold",
    children: <Bold className="h-4 w-4" />,
  },
  argTypes: {
    children: {
      control: { disable: true },
    },
  },
  component: Toggle,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "Commons/Atoms/Toggle",
};
export default meta;

type Story = StoryObj<typeof Toggle>;

/**
 * The default form of the toggle.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const toggle = canvas.getByRole("button", { name: /toggle bold/i });
    expect(toggle).toBeInTheDocument();

    // Default state is unpressed
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    // Clicking toggles the state
    await userEvent.click(toggle, { delay: 50 });
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    // Clicking again turns it off
    await userEvent.click(toggle, { delay: 50 });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
  },
};

/**
 * Outline variant toggle.
 */
export const Outline: Story = {
  args: {
    "aria-label": "Toggle italic",
    children: <Italic className="h-4 w-4" />,
    variant: "outline",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("button", { name: /toggle italic/i });

    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(toggle, { delay: 50 });
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  },
};

/**
 * Toggle with text inside.
 */
export const WithText: Story = {
  args: { ...Outline.args },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const toggle = canvas.getByRole("button", { name: /italic/i });
    const label = canvas.getByText("Italic");

    expect(toggle).toBeInTheDocument();
    expect(label).toBeInTheDocument();

    await userEvent.click(toggle, { delay: 50 });
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  },
  render: args => (
    <Toggle {...args}>
      <Italic className="mr-2 h-4 w-4" />
      Italic
    </Toggle>
  ),
};

/**
 * Small size.
 */
export const Small: Story = {
  args: {
    size: "sm",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const toggle = canvas.getByRole("button", { name: /toggle bold/i });
    expect(toggle).toBeInTheDocument();

    // Clicking still works
    await userEvent.click(toggle, { delay: 50 });
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  },
};

/**
 * Large size.
 */
export const Large: Story = {
  args: {
    size: "lg",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const toggle = canvas.getByRole("button", { name: /toggle bold/i });
    expect(toggle).toBeInTheDocument();

    await userEvent.click(toggle, { delay: 50 });
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  },
};

/**
 * Add the `disabled` prop to prevent interactions with the toggle.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const toggle = canvas.getByRole("button", { name: /toggle bold/i });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(toggle).toBeDisabled();
  },
};
