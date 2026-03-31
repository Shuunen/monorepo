import type { Meta, StoryObj } from "@storybook/react-vite";
import { CardOperation } from "./card-operation";

const meta = {
  component: CardOperation,
  tags: ["autodocs"],
  title: "Commons/Molecules/CardOperation",
  decorators: [
    Story => (
      <div className="w-62.5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CardOperation>;

export default meta;

type Story = StoryObj<typeof CardOperation>;

export const Default: Story = {
  render: () => (
    <CardOperation
      title="The Card Title"
      description="This is a description of the card."
      action="Do something"
      url={{ to: "/" }}
    />
  ),
};
