import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Label } from './label'

const meta = {
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Commons/Atoms/Label',
} satisfies Meta<typeof Label>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Label text',
    htmlFor: 'test-input',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Label renders
    const label = canvas.getByText('Label text')
    expect(label).toBeInTheDocument()
    expect(label.tagName.toLowerCase()).toBe('label')

    // Input renders
    const input = canvas.getByTestId('input-field')
    expect(input).toBeInTheDocument()

    // Label is associated with input
    expect(label).toHaveAttribute('for', 'test-input')

    // Clicking the label should focus the input
    await userEvent.click(label, { delay: 80 })
    expect(input).toHaveFocus()
  },
  render: args => (
    <div className="flex flex-col gap-2">
      <Label {...args} />
      {/** biome-ignore lint/correctness/useUniqueElementIds: it's ok here */}
      <input data-testid="input-field" id="test-input" />
    </div>
  ),
}
