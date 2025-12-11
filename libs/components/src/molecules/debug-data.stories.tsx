import type { Meta, StoryObj } from "@storybook/react-vite";
import { DebugData } from "./debug-data";

const meta = {
  component: DebugData,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "Commons/Molecules/DebugData",
} satisfies Meta<typeof DebugData>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: {
    data: {
      age: 36,
      name: "Romani Paeon",
    },
  },
};
