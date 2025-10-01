import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'
import type { ContactForm } from './form-contact.tsx'
import { FormUser } from './form-user.tsx'

function Wrapper() {
  const methods = useForm({
    defaultValues: {
      user: {
        firstName: '',
        lastName: '',
      },
    },
  })

  return (
    <FormProvider {...methods}>
      <FormUser<ContactForm> name="user" />
    </FormProvider>
  )
}

const meta = {
  component: Wrapper,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'molecules/FormUser',
} satisfies Meta<typeof FormUser>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
