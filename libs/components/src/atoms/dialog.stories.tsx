import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Button } from './button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger } from './dialog'

const meta = {
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'atoms/Dialog',
} satisfies Meta<typeof Dialog>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
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
  },
}
