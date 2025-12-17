import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormSummary } from "./form-summary";

const meta: Meta<typeof FormSummary> = {
  component: FormSummary,
  parameters: {
    layout: "centered",
  },
  title: "Commons/Molecules/FormSummary",
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: {
    data: {
      address: {
        label: "Address",
        value: "123 Main St, Anytown, USA",
      },
      age: {
        label: "Age",
        value: 30,
      },
      email: {
        label: "Email",
        value: "john@example.com",
      },
      name: {
        label: "Name",
        value: "John Doe",
      },
    },
  },
};

export const LongList: Story = {
  args: {
    data: Object.fromEntries(
      Array.from({ length: 50 }, (_, index) => [`field${index + 1}`, `Value ${index + 1}`]).map(([key, value]) => [
        key,
        {
          label: `Field ${key}`,
          value,
        },
      ]),
    ),
  },
};
