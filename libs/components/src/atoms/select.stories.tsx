import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";

/**
 * Displays a list of options for the user to pick from—triggered by a button.
 */
const meta: Meta<typeof Select> = {
  args: {
    onValueChange: fn(),
  },
  argTypes: {},
  component: Select,
  parameters: {
    layout: "centered",
  },
  render: args => (
    <Select {...args}>
      <SelectTrigger className="w-96" name="fruit-select" title="Select">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem name="fruit" value="apple">
            Apple
          </SelectItem>
          <SelectItem name="fruit" value="banana">
            Banana
          </SelectItem>
          <SelectItem name="fruit" value="blueberry">
            Blueberry
          </SelectItem>
          <SelectItem name="fruit" value="grapes">
            Grapes
          </SelectItem>
          <SelectItem name="fruit" value="pineapple">
            Pineapple
          </SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Vegetables</SelectLabel>
          <SelectItem name="fruit" value="aubergine">
            Aubergine
          </SelectItem>
          <SelectItem name="fruit" value="broccoli">
            Broccoli
          </SelectItem>
          <SelectItem name="fruit" disabled value="carrot">
            Carrot
          </SelectItem>
          <SelectItem name="fruit" value="courgette">
            Courgette
          </SelectItem>
          <SelectItem name="fruit" value="leek">
            Leek
          </SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Meat</SelectLabel>
          <SelectItem name="fruit" value="beef">
            Beef
          </SelectItem>
          <SelectItem name="fruit" value="chicken">
            Chicken
          </SelectItem>
          <SelectItem name="fruit" value="lamb">
            Lamb
          </SelectItem>
          <SelectItem name="fruit" value="pork">
            Pork
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
  tags: ["autodocs"],
  title: "Commons/Atoms/Select",
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the select.
 */
export const Default: Story = {};

export const ShouldSelectOption: Story = {
  name: "Should check selected option",
  play: async ({ canvasElement, step }) => {
    const canvasBody = within(canvasElement.ownerDocument.body);
    const select = await canvasBody.findByRole("combobox");

    await step("open and select item", async () => {
      await userEvent.click(select);
      const options = canvasBody.getAllByRole("option");
      await userEvent.click(options[1]);
      expect(select).toHaveTextContent("Banana");
    });

    await step("verify the selected option", async () => {
      await userEvent.click(select);
      const options = canvasBody.getAllByRole("option");
      expect(options[1]).toHaveAttribute("data-state", "checked");
      await userEvent.click(options[1]);
    });
  },
};
