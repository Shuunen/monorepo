import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from './select'

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
    layout: 'centered',
  },
  render: args => (
    <Select {...args}>
      <SelectTrigger className="w-96" name="fruit-select" title="Select">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="blueberry">Blueberry</SelectItem>
          <SelectItem value="grapes">Grapes</SelectItem>
          <SelectItem value="pineapple">Pineapple</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Vegetables</SelectLabel>
          <SelectItem value="aubergine">Aubergine</SelectItem>
          <SelectItem value="broccoli">Broccoli</SelectItem>
          <SelectItem disabled value="carrot">
            Carrot
          </SelectItem>
          <SelectItem value="courgette">Courgette</SelectItem>
          <SelectItem value="leek">Leek</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Meat</SelectLabel>
          <SelectItem value="beef">Beef</SelectItem>
          <SelectItem value="chicken">Chicken</SelectItem>
          <SelectItem value="lamb">Lamb</SelectItem>
          <SelectItem value="pork">Pork</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
  tags: ['autodocs'],
  title: 'Commons/Atoms/Select',
} satisfies Meta<typeof Select>

export default meta

type Story = StoryObj<typeof meta>

/**
 * The default form of the select.
 */
export const Default: Story = {}

export const ShouldSelectOption: Story = {
  name: 'Should check selected option',
  play: async ({ canvasElement, step }) => {
    const canvasBody = within(canvasElement.ownerDocument.body)
    const select = await canvasBody.findByRole('combobox')

    await step('open and select item', async () => {
      await userEvent.click(select)
      const options = canvasBody.getAllByRole('option')
      await userEvent.click(options[1])
      expect(select).toHaveTextContent('Banana')
    })

    await step('verify the selected option', async () => {
      await userEvent.click(select)
      const options = canvasBody.getAllByRole('option')
      expect(options[1]).toHaveAttribute('data-state', 'checked')
      await userEvent.click(options[1])
    })
  },
}
