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
      address: "123 Main St",
      age: 30,
      email: "john@example.com",
      name: "John Doe",
    },
  },
};

export const NestedData: Story = {
  args: {
    data: {
      user: {
        address: {
          city: "Springfield",
          street: "456 Elm St",
          zip: "98765",
        },
        contact: {
          email: "jane.smith@example.com",
          phone: "555-1234",
        },
        name: "Jane Smith",
      },
    },
  },
};

export const LongList: Story = {
  args: {
    data: Object.fromEntries(Array.from({ length: 50 }, (_, index) => [`field${index + 1}`, `Value ${index + 1}`])),
  },
};

export const WithRootPath: Story = {
  args: {
    data: {
      firstName: "John",
      lastName: "Doe",
    },
    rootPath: "user",
  },
};
