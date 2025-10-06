import { zodResolver } from '@hookform/resolvers/zod'
import { Button, DebugData, Form } from '@monorepo/components'
import { sleep } from '@monorepo/utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { expect, userEvent, within } from 'storybook/test'
import { z } from 'zod/v4'
import { FormFileUpload } from './form-file-upload'
import { documentAccept, documentFileSchema, uploadDurationSuccess } from './form-file-upload.utils'

const meta = {
  component: FormFileUploadStoryWrapper,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'molecules/FormFileUpload',
} satisfies Meta<typeof FormFileUploadStoryWrapper>

export default meta
type Story = StoryObj<typeof meta>

const fileFormSchema = z.object({
  file: documentFileSchema,
})

type FileForm = z.infer<typeof fileFormSchema>

// Wrapper to avoid code duplication in stories
function FormFileUploadStoryWrapper({ defaultValues, shouldFail = false, accept = documentAccept }: { defaultValues?: Partial<FileForm>; shouldFail?: boolean; accept?: string } = {}) {
  const form = useForm<FileForm>({
    defaultValues,
    resolver: zodResolver(fileFormSchema),
  })
  const value = form.watch('file')
  const [formSubmitted, setFormSubmitted] = useState(false)
  const onSubmit = form.handleSubmit(() => {
    setFormSubmitted(true)
  })
  return (
    <div className="flex flex-col gap-6">
      <Form {...form}>
        <form className="space-y-4" onSubmit={onSubmit}>
          <FormFileUpload accept={accept} form={form} isRequired={false} name="file" schema={documentFileSchema} shouldFail={shouldFail} testId="file" />
          <Button testId="submit" type="submit">
            Submit
          </Button>
        </form>
      </Form>
      <DebugData data={{ accept, fileNameSelected: value?.name, formSubmitted, formValid: form.formState.isValid }} />
    </div>
  )
}

export const Default: Story = {
  render: () => <FormFileUploadStoryWrapper />,
}

export const WithExistingFile: Story = {
  render: () => {
    // oxlint-disable-next-line no-undef
    const existingFile = new File(['test'], 'test.txt', { type: 'text/plain' })
    return <FormFileUploadStoryWrapper defaultValues={{ file: existingFile }} />
  },
}

export const UploadWillFail: Story = {
  render: () => <FormFileUploadStoryWrapper shouldFail={true} />,
}

export const BadlyFormattedFile: Story = {
  // @ts-expect-error Simulating a badly formatted file
  render: () => <FormFileUploadStoryWrapper defaultValues={{ file: {} }} />,
}

export const ValidFileUpload: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })
    const input = canvas.getByTestId('file')
    await userEvent.upload(input, file)
    await sleep(uploadDurationSuccess + 200)
    await expect(canvas.getByText('Uploading succeeded')).toBeInTheDocument()
    const submit = canvas.getByTestId('submit')
    await expect(submit).toBeEnabled()
    await userEvent.click(submit)
    await expect(canvas.getByText('formSubmitted": true')).toBeInTheDocument()
  },
  render: () => <FormFileUploadStoryWrapper />,
}

export const InvalidSchema: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const file = new File(['cat'], 'cat.jpg', { type: 'image/jpeg' })
    const input = canvas.getByTestId('file')
    await userEvent.upload(input, file)
    await sleep(200)
    await expect(canvas.getByText('Uploading failed')).toBeInTheDocument()
    await expect(canvas.getByText('formValid": false')).toBeInTheDocument()
  },
  render: () => <FormFileUploadStoryWrapper accept=".jpg" />,
}

export const UploadFailing: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })
    const input = canvas.getByTestId('file')
    await userEvent.upload(input, file)
    await sleep(uploadDurationSuccess)
    await expect(canvas.getByText('Uploading failed')).toBeInTheDocument()
    const submit = canvas.getByTestId('submit')
    await expect(submit).toBeEnabled()
    await userEvent.click(submit)
    await expect(canvas.getByText('formValid": false')).toBeInTheDocument()
  },
  render: () => <FormFileUploadStoryWrapper shouldFail={true} />,
}
