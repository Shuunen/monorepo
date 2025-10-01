import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { FormContact } from './form-contact'

const meta = {
  component: FormContact,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'molecules/FormContact',
} satisfies Meta<typeof FormContact>

export default meta

type Story = StoryObj<typeof meta>

export const EmptyForm: Story = {}

export const FilledForm: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // fill the form
    await userEvent.type(canvas.getByTestId('user.firstName'), 'Nicolas')
    await userEvent.type(canvas.getByTestId('user.lastName'), 'Lafon')
    await expect(canvas.getByTestId('submit')).toBeDisabled()
    await userEvent.type(canvas.getByTestId('message'), 'Hello world!')
    // submit
    await expect(canvas.getByTestId('submit')).toBeEnabled()
    await userEvent.click(canvas.getByTestId('submit'))
    // clear
    await userEvent.click(canvas.getByTestId('reset'))
    await expect(canvas.getByTestId('user.firstName')).toHaveValue('')
    await expect(canvas.getByTestId('user.lastName')).toHaveValue('')
    await expect(canvas.getByTestId('message')).toHaveValue('')
    await expect(canvas.getByTestId('submit')).toBeDisabled()
  },
}
