import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Landing } from "./landing";

const meta: Meta<typeof Landing> = {
  component: Landing,
  title: "Commons/Molecules/Landing",
};

export default meta;

type Story = StoryObj<typeof Landing>;

export const Basic: Story = {
  args: {
    status: "This is a status message.",
    subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    title: "Welcome to Landing",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Welcome to Landing")).toBeTruthy();
  },
};
