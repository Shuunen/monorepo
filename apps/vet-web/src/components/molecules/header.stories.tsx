import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Header } from "./header";

/**
 * Displays an header
 */
const meta = {
  component: Header,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "VetWeb/Atoms/Header",
} satisfies Meta<typeof Header>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByRole("heading", { name: "Vet Web" });
    expect(title).toBeInTheDocument();
    const callButton = canvas.getByTestId("button-call-us");
    expect(callButton).toBeInTheDocument();
    await userEvent.click(callButton);
  },
};
