import type { Meta, StoryObj } from '@storybook/react-vite'
import { toast } from 'sonner'
import { expect, screen, userEvent, within } from 'storybook/test'
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
  title: 'Commons/Atoms/Toaster',
}

export default meta

type Story = StoryObj<typeof meta>

export const Info: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const button = canvas.getByTestId('show-toast')
    expect(button).toBeInTheDocument()

    // Click to show toast
    await userEvent.click(button, { delay: 200 })

    const toastMessage = await screen.findByText('This is an info toast!')
    expect(toastMessage).toBeVisible()
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <Button name="show-toast" onClick={() => toast.info('This is an info toast!')}>
        Show Info Toast
      </Button>
    </div>
  ),
}

export const Success: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const button = canvas.getByTestId('show-toast')
    expect(button).toBeInTheDocument()

    // Click to show toast
    await userEvent.click(button, { delay: 200 })

    const toastMessage = await screen.findByText('This is a success toast!')
    expect(toastMessage).toBeVisible()
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <Button name="show-toast" onClick={() => toast.success('This is a success toast!')}>
        Show Success Toast
      </Button>
    </div>
  ),
}
