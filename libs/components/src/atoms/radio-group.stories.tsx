/** biome-ignore-all lint/correctness/useUniqueElementIds: it's ok here */
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Label } from './label'
import { RadioGroup, RadioGroupItem } from './radio-group'

const meta = {
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'atoms/Radio group',
} satisfies Meta<typeof RadioGroup>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: 'radio-group',
  },
  render: () => (
    <RadioGroup defaultValue="comfortable" name="radio-group">
      <div className="flex items-center space-x-2">
        <RadioGroupItem id="r1" name="radio-item-1" value="default" />
        <Label htmlFor="r1">Default</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem id="r2" name="radio-item-2" value="comfortable" />
        <Label htmlFor="r2">Comfortable</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem id="r3" name="radio-item-3" value="compact" />
        <Label htmlFor="r3">Compact</Label>
      </div>
    </RadioGroup>
  ),
}
