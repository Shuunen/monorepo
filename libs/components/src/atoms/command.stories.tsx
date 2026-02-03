import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./command";

/**
 * Fast, composable, unstyled command menu for React.
 */
const meta = {
  args: {
    className: "rounded-lg w-96 border shadow-md",
  },
  argTypes: {},
  component: Command,
  parameters: {
    layout: "centered",
  },
  render: args => (
    <Command {...args}>
      <CommandInput name="story" placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>Calendar</CommandItem>
          <CommandItem>Search Emoji</CommandItem>
          <CommandItem disabled>Calculator</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>Profile</CommandItem>
          <CommandItem>Billing</CommandItem>
          <CommandItem>Settings</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
  tags: ["autodocs"],
  title: "Commons/Atoms/Command",
} satisfies Meta<typeof Command>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the command.
 */
export const Default: Story = {
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Ensure items are present
    const calendar = canvas.getByRole("option", { name: /calendar/i });
    expect(calendar).toBeInTheDocument();

    const searchEmojiOptions = canvas.getAllByRole("option", { name: /search emoji/i });
    expect(searchEmojiOptions).toHaveLength(1);

    const calculator = canvas.getByRole("option", { name: /calculator/i });
    expect(calculator).toBeInTheDocument();
  },
};

export const TypingInCombobox: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox");

    // Search for "calendar" which should return a single result
    await userEvent.type(input, "calen", { delay: 100 });
    expect(canvas.getAllByRole("option", { name: /calendar/i })).toHaveLength(1);

    await userEvent.clear(input);

    // Search for "se" which should return multiple results
    await userEvent.type(input, "se", { delay: 100 });
    expect(canvas.getAllByRole("option").length).toBeGreaterThan(1);
    expect(canvas.getAllByRole("option", { name: /search/i })).toHaveLength(1);

    await userEvent.clear(input);

    // Search for "story" which should return no results
    await userEvent.type(input, "story", { delay: 100 });
    expect(canvas.queryAllByRole("option", { hidden: false })).toHaveLength(0);
    expect(canvas.getByText(/no results/i)).toBeVisible();
  },
};
