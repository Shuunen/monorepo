import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, screen, within } from 'storybook/test'
import { Button } from './button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger } from './dialog'

const meta = {
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Commons/Atoms/Dialog',
} satisfies Meta<typeof Dialog>

export default meta

type Story = StoryObj<typeof meta>

const DialogExample = () => {
  const [open, setOpen] = useState(true)
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button name="open-dialog">Open Dialog</Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>This is a dialog description.</DialogDescription>
          </DialogHeader>
          <div>Dialog body content goes here.</div>
          <DialogFooter>
            <DialogClose asChild>
              <Button name="close" variant="secondary">
                Close
              </Button>
            </DialogClose>
            <Button name="save">Save</Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}

export const Default: Story = {
  // Basic tests only
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Trigger button is inside the canvas
    const openButton = canvas.getByTestId('open-dialog')
    expect(openButton).toBeInTheDocument()

    // Dialog content is rendered in a portal: use `screen`
    const title = await screen.findByText(/dialog title/i)
    const description = screen.getByText(/this is a dialog description/i)

    expect(title).toBeVisible()
    expect(description).toBeVisible()
  },
  render: () => <DialogExample />,
}
