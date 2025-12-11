import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Label } from './label'
import { RadioGroup, RadioGroupItem } from './radio-group'

const meta = {
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Commons/Atoms/Radio group',
} satisfies Meta<typeof RadioGroup>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: 'radio-group',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // All three radios are present
    const radios = canvas.getAllByRole('radio')
    expect(radios).toHaveLength(3)

    const defaultRadio = canvas.getByRole('radio', { name: /default/i })
    const comfortableRadio = canvas.getByRole('radio', { name: /comfortable/i })
    const compactRadio = canvas.getByRole('radio', { name: /compact/i })

    expect(defaultRadio).toBeInTheDocument()
    expect(comfortableRadio).toBeInTheDocument()
    expect(compactRadio).toBeInTheDocument()

    // By default, "comfortable" should be selected
    expect(comfortableRadio).toHaveAttribute('data-state', 'checked')
    expect(defaultRadio).toHaveAttribute('data-state', 'unchecked')
    expect(compactRadio).toHaveAttribute('data-state', 'unchecked')

    // Clicking the "Default" label should select the "default" radio
    const defaultLabel = canvas.getByText('Default')
    await userEvent.click(defaultLabel, { delay: 80 })

    expect(defaultRadio).toHaveAttribute('data-state', 'checked')
    expect(comfortableRadio).toHaveAttribute('data-state', 'unchecked')
    expect(compactRadio).toHaveAttribute('data-state', 'unchecked')
  },
  render: () => (
    <RadioGroup defaultValue="comfortable" name="radio-group">
      <div className="flex items-center space-x-2">
        {/** biome-ignore lint/correctness/useUniqueElementIds: it's ok here */}
        <RadioGroupItem id="r1" name="radio-item-1" value="default" />
        <Label htmlFor="r1">Default</Label>
      </div>
      <div className="flex items-center space-x-2">
        {/** biome-ignore lint/correctness/useUniqueElementIds: it's ok here */}
        <RadioGroupItem id="r2" name="radio-item-2" value="comfortable" />
        <Label htmlFor="r2">Comfortable</Label>
      </div>
      <div className="flex items-center space-x-2">
        {/** biome-ignore lint/correctness/useUniqueElementIds: it's ok here */}
        <RadioGroupItem id="r3" name="radio-item-3" value="compact" />
        <Label htmlFor="r3">Compact</Label>
      </div>
    </RadioGroup>
  ),
}
