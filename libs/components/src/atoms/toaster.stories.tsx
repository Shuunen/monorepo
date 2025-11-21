import type { Meta, StoryObj } from '@storybook/react-vite'
import { toast } from 'sonner'
import { Button } from './button'
import { Toaster } from './toaster'

const meta: Meta<typeof Toaster> = {
  component: Toaster,
  decorators: [
    function StoryDecorator(Story) {
      return (
        <>
          <Toaster name="default" />
          <Story />
        </>
      )
    },
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'atoms/Toaster',
}

export default meta

type Story = StoryObj<typeof meta>

export const Info: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Button name="show-toast" onClick={() => toast.info('This is an info toast!')}>
        Show Info Toast
      </Button>
    </div>
  ),
}

export const Success: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Button name="show-toast" onClick={() => toast.success('This is a success toast!')}>
        Show Success Toast
      </Button>
    </div>
  ),
}
