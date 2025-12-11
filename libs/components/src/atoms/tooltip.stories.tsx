import type { Meta, StoryObj } from '@storybook/react-vite'
import { Plus } from 'lucide-react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'

/**
 * A popup that displays information related to an element when the element
 * receives keyboard focus or the mouse hovers over it.
 */
const meta: Meta<typeof TooltipContent> = {
  args: {
    children: 'Add to library',
    side: 'top',
  },
  argTypes: {
    children: {
      control: 'text',
    },
    side: {
      control: {
        type: 'radio',
      },
      options: ['top', 'bottom', 'left', 'right'],
    },
  },
  component: TooltipContent,
  parameters: {
    layout: 'centered',
  },
  render: args => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger name="test">
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add</span>
        </TooltipTrigger>
        <TooltipContent {...args} />
      </Tooltip>
    </TooltipProvider>
  ),
  tags: ['autodocs'],
  title: 'Commons/Atoms/Tooltip',
} satisfies Meta<typeof TooltipContent>

export default meta

type Story = StoryObj<typeof meta>

/**
 * The default form of the tooltip.
 */
export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvasBody = within(canvasElement.ownerDocument.body)
    const triggerBtn = await canvasBody.findByRole('button', { name: /add/i })

    await step('hover over trigger', async () => {
      await userEvent.hover(triggerBtn)
      await waitFor(() => expect(canvasElement.ownerDocument.body.querySelector('[data-radix-popper-content-wrapper]')).toBeVisible())
    })

    await step('unhover trigger', async () => {
      await userEvent.unhover(triggerBtn)
      await waitFor(() => {
        const tooltipElement = canvasElement.ownerDocument.body.querySelector('[data-radix-popper-content-wrapper]')
        expect(tooltipElement).toBeNull()
      })
    })
  },
}

/**
 * Use the `bottom` side to display the tooltip below the element.
 */
export const Bottom: Story = {
  args: {
    side: 'bottom',
  },
}

/**
 * Use the `left` side to display the tooltip to the left of the element.
 */
export const Left: Story = {
  args: {
    side: 'left',
  },
}

/**
 * Use the `right` side to display the tooltip to the right of the element.
 */
export const Right: Story = {
  args: {
    side: 'right',
  },
}
