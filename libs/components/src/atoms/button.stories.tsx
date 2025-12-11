import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
import { Button } from "./button";

/**
 * Displays a button or a component that looks like a button.
 */
const meta = {
  args: { onClick: fn() },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["primary", "secondary", "ghost", "link"],
    },
  },
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "Commons/Atoms/Button",
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the primary button.
 */
export const Primary: Story = {
  args: {
    children: "Primary",
    name: "primary",
  },
  play: ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    const primaryButton = canvas.getByText("Primary");
    expect(primaryButton).toBeInTheDocument();

    expect(primaryButton).toHaveClass("bg-primary");

    primaryButton.click();
    expect(args.onClick).toHaveBeenCalled();
  },
};

/**
 * The secondary variant of the button.
 */
export const Secondary: Story = {
  args: {
    children: "Secondary",
    name: "secondary",
    variant: "secondary",
  },
  play: ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    const secondaryButton = canvas.getByText("Secondary");
    expect(secondaryButton).toBeInTheDocument();

    expect(secondaryButton).toHaveClass("bg-secondary");

    secondaryButton.click();
    expect(args.onClick).toHaveBeenCalled();
  },
};

/**
 * The button with "asChild" prop.
 */
export const AsChild: Story = {
  args: {
    asChild: true,
    children: <span>child element</span>,
    name: "as-child",
  },
  play: ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    const childButton = canvas.getByTestId("as-child-button");
    const spanElement = canvas.getByText("child element");
    expect(spanElement).toBeInTheDocument();
    expect(childButton).toContainElement(spanElement);

    childButton.click();
    expect(args.onClick).toHaveBeenCalled();
  },
};
