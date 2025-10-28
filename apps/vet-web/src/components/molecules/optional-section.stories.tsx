import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Form, FormControl, FormItem, FormLabel, FormMessage, Input } from '@monorepo/components'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'
import { logger } from '../../utils/logger.utils'
import { OptionalSection } from './optional-section'

const formSchema = z
  .object({
    knowsParent: z.boolean().optional(),
    parentIdentifier: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.knowsParent && (!data.parentIdentifier || data.parentIdentifier.trim() === ''))
      ctx.addIssue({
        code: 'invalid_type',
        expected: 'string',
        message: 'Parent identifier is required when you know the parent',
        path: ['parentIdentifier'],
      })
  })

type FormData = z.infer<typeof formSchema>

const onSubmit = (_values: FormData) => {
  logger.info('onSubmit', _values)
}

function OptionalSectionDemo({ defaultChecked = false }: { defaultChecked?: boolean }) {
  const form = useForm<FormData>({
    defaultValues: {
      knowsParent: defaultChecked,
      parentIdentifier: '',
    },
    resolver: zodResolver(formSchema),
  })

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-lg font-semibold">Optional Section Demo</h2>
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <OptionalSection checkboxLabel="I know the parent animal" checkboxName="knowsParent" checkboxTestId="knows-parent" conditionalFieldName="parentIdentifier" form={form}>
            {field => (
              <FormItem>
                <FormLabel>Parent identifier</FormLabel>
                <FormControl>
                  <Input placeholder="Enter parent ID" {...field} data-testid="parent-identifier" value={(field.value as string) || ''} />
                </FormControl>
                <FormMessage testId="parent-identifier-error" />
              </FormItem>
            )}
          </OptionalSection>

          <Button testId="submit" type="submit">
            Submit
          </Button>
        </form>
      </Form>
    </div>
  )
}

const meta = {
  component: OptionalSectionDemo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'molecules/OptionalSection',
} satisfies Meta<typeof OptionalSectionDemo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    defaultChecked: false,
  },
}

export const CheckedByDefault: Story = {
  args: {
    defaultChecked: true,
  },
}
