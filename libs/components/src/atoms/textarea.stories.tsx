import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Textarea } from "./textarea";

const meta = {
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "Commons/Atoms/Textarea",
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the textarea.
 */
export const Default: Story = {
  args: {
    name: "default",
    placeholder: "Enter your message here",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const textarea = canvas.getByPlaceholderText("Enter your message here") as HTMLTextAreaElement;

    expect(textarea).toBeDefined();
    expect(textarea.value).toBe("");

    // Typing should update the value
    await userEvent.type(textarea, "Hello world", { delay: 40 });
    expect(textarea.value).toBe("Hello world");
  },
};

/**
 * Use the `disabled` prop to disable the textarea.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    name: "disabled",
    placeholder: "Disabled textarea",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const textarea = canvas.getByPlaceholderText("Disabled textarea") as HTMLTextAreaElement;

    expect(textarea).toBeDefined();
    expect(textarea).toBeDisabled();
    expect(textarea.value).toBe("");

    // Typing should NOT update the value
    await userEvent.type(textarea, "Hello world", { delay: 40 });
    expect(textarea.value).toBe("");
  },
};
