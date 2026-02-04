import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Badge } from "./badge";

/**
 * Displays a badge or a component that looks like a badge.
 */
const meta = {
  args: {
    children: "Badge",
    variant: "default",
  },
  argTypes: {
    asChild: {
      table: { disable: true },
    },
    children: {
      control: "text",
      description: "Badge content",
    },
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline", "success", "warning"],
    },
  },
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "Commons/Atoms/Badge",
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the badge.
 */
export const Default: Story = {
  args: {
    name: "default",
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText("Badge");
    expect(badge).toBeInTheDocument(); // Check that the badge is on the page
    expect(badge).toHaveClass("bg-primary"); // Check that the right class is applied
  },
};

/**
 * Use the `secondary` badge to call for less urgent information, blending
 * into the interface while still signaling minor updates or statuses.
 */
export const Secondary: Story = {
  args: {
    name: "secondary",
    variant: "secondary",
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText("Badge");
    expect(badge).toHaveClass("bg-secondary");
  },
};

/**
 * Use the `destructive` badge to indicate errors, alerts, or the need for
 * immediate attention.
 */
export const Destructive: Story = {
  args: {
    name: "destructive",
    variant: "destructive",
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText("Badge");
    expect(badge).toHaveClass("bg-destructive/10");
  },
};

/**
 * Use the `outline` badge for overlaying without obscuring interface details,
 * emphasizing clarity and subtlety.
 */
export const Outline: Story = {
  args: {
    name: "outline",
    variant: "outline",
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText("Badge");
    expect(badge).toHaveClass("text-foreground");
  },
};

export const Success: Story = {
  args: {
    name: "success",
    variant: "success",
  },
};

export const Warning: Story = {
  args: {
    name: "warning",
    variant: "warning",
  },
};
