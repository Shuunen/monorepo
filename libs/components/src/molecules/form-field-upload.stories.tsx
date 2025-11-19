import { isBrowserEnvironment, Logger, nbHueMax, sleep, stringify } from '@monorepo/utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { z } from 'zod'
import { AutoForm } from './auto-form'
import { DebugData } from './debug-data'
import { fileSchema } from './form-field-upload.const'

const logger = new Logger({ minimumLevel: isBrowserEnvironment() ? '3-info' : '5-warn' })

const meta = {
  component: AutoForm,
  parameters: {
    docs: {
      description: {
        component: 'A file upload field component with progress tracking, validation, and error handling. Integrates with AutoForm for automatic form generation.',
      },
    },
    layout: 'centered',
  },
  render: args => {
    type FormData = { document?: File } | undefined
    const [formData, setFormData] = useState<Partial<FormData>>({})
    function onChange(data: Partial<FormData>) {
      setFormData(data)
      logger.info('Form data changed', data)
    }
    const [submittedData, setSubmittedData] = useState<FormData>(undefined)
    function onSubmit(data: FormData) {
      setSubmittedData(data)
      logger.showSuccess('Form submitted successfully')
    }
    return (
      <div className="grid gap-4 mt-6 w-lg">
        <DebugData data={{ fileNameSelected: formData?.document?.name }} isGhost title="Form data" />
        <AutoForm {...args} logger={logger} onChange={onChange} onSubmit={onSubmit} />
        <DebugData data={{ fileNameSelected: submittedData?.document?.name }} isGhost title="Submitted data" />
      </div>
    )
  },
  tags: ['autodocs'],
  title: 'molecules/FormFieldUpload',
} satisfies Meta<typeof AutoForm>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  args: {
    schemas: [
      z.object({
        document: z.file().optional().meta({
          label: 'Optional document',
          placeholder: 'Select a document',
        }),
      }),
    ],
  },
}

export const Required: Story = {
  args: {
    schemas: [
      z.object({
        document: z.file().meta({
          label: 'Required document',
          placeholder: 'Select a required file',
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const formData = canvas.getByTestId('debug-data-form-data')
    const submittedData = canvas.getByTestId('debug-data-submitted-data')
    step('cannot submit form initially', () => {
      const submitButton = canvas.getByRole('button', { name: 'Submit' })
      expect(submitButton).toBeDisabled()
      expect(formData).toContainHTML('{}')
      expect(submittedData).toContainHTML('{}')
    })
    await step('upload a file successfully and submit the form', async () => {
      const submitButton = canvas.getByRole('button', { name: 'Submit' })
      const file = new File(['hello'], 'test-doc.pdf', { type: 'application/pdf' })
      const input = canvas.getByTestId('document-upload-idle') as HTMLInputElement
      await userEvent.upload(input, file)
      await sleep(nbHueMax) // needed
      expect(formData).toContainHTML('test-doc.pdf')
      expect(submittedData).toContainHTML('{}')
      expect(submitButton).not.toBeDisabled()
      await userEvent.click(submitButton)
      expect(formData).toContainHTML('test-doc.pdf')
      expect(submittedData).toContainHTML('test-doc.pdf')
    })
    await step('remove the file and check that form cannot be submitted', async () => {
      const removeButton = canvas.getByRole('button', { name: 'Remove' })
      await userEvent.click(removeButton)
      expect(formData).toContainHTML('{}')
      const errorMessage = canvas.getByTestId('form-message-document')
      expect(errorMessage).toHaveTextContent('Invalid input: expected file, received undefined')
      const submitButton = canvas.getByRole('button', { name: 'Submit' })
      expect(submitButton).toBeDisabled()
    })
  },
}

export const ExistingFile: Story = {
  args: {
    initialData: {
      document: new File(['test'], 'test.txt', { type: 'text/plain' }),
    },
    schemas: [
      z.object({
        document: z.file().meta({
          label: 'Document required',
          placeholder: 'Select a document',
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const formData = canvas.getByTestId('debug-data-form-data')
    const submittedData = canvas.getByTestId('debug-data-submitted-data')
    step('shows the existing file in the upload field', () => {
      const fileInput = canvas.getByTestId('document-upload-success') as HTMLInputElement
      expect(fileInput).toBeInTheDocument()
      expect(formData).toContainHTML('test.txt')
      expect(submittedData).toContainHTML('{}')
    })
    await step('submit the form with the existing file', async () => {
      const submitButton = canvas.getByRole('button', { name: 'Submit' })
      expect(submitButton).not.toBeDisabled()
      await userEvent.click(submitButton)
      expect(formData).toContainHTML('test.txt')
      expect(submittedData).toContainHTML('test.txt')
    })
  },
}

export const FileSchemaValidation: Story = {
  args: {
    schemas: [
      z.object({
        document: fileSchema(['pdf', 'jpg', 'png'], true).meta({
          label: 'Image or PDF document',
          placeholder: 'Select a PDF or image file',
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const formData = canvas.getByTestId('debug-data-form-data')
    const submittedData = canvas.getByTestId('debug-data-submitted-data')
    await step('accepts valid pdf', async () => {
      const input = canvas.getByTestId('document-upload-idle') as HTMLInputElement
      const file = new File(['test'], 'document.pdf', { type: 'application/pdf' })
      await userEvent.upload(input, file)
      await sleep(nbHueMax)
      expect(formData).toContainHTML('document.pdf')
      const submitButton = canvas.getByRole('button', { name: 'Submit' })
      expect(submitButton).not.toBeDisabled()
      await userEvent.click(submitButton)
      expect(submittedData).toContainHTML('document.pdf')
    })
    await step('rejects invalid txt file', async () => {
      const removeButton = canvas.getByRole('button', { name: 'Remove' })
      await userEvent.click(removeButton)
      const input = canvas.getByTestId('document-upload-idle') as HTMLInputElement
      const file = new File(['test'], 'document.txt', { type: 'text/plain' })
      await userEvent.upload(input, file)
      await sleep(nbHueMax)
      const errorMessage = canvas.getByTestId('form-message-document')
      expect(errorMessage).toHaveTextContent('File extension not allowed, accepted : pdf, jpg, png')
      expect(formData).toContainHTML(stringify({ fileNameSelected: 'document.txt' }, true))
      const submitButton = canvas.getByRole('button', { name: 'Submit' })
      expect(submitButton).toBeDisabled()
    })
  },
}

export const ResponsiveLayout: Story = {
  args: {
    initialData: {
      document: new File(['test content'], 'very-long-filename-that-might-overflow-on-small-screens.pdf', { type: 'application/pdf' }),
    },
    schemas: [
      z.object({
        document: z.file().meta({
          label: 'Document upload',
          placeholder: 'Select a file to upload',
        }),
      }),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the FormFieldUpload responsiveness across different viewport sizes. Resize your browser window or use the viewport toolbar to see how the component adapts to mobile, tablet, and desktop screens.',
      },
    },
    layout: 'padded',
    viewport: {
      defaultViewport: 'responsive',
    },
  },
  render: args => {
    type FormData = { document?: File } | undefined
    function onChange(data: Partial<FormData>) {
      logger.info('Form data changed', data)
    }
    function onSubmit(data: FormData) {
      logger.showSuccess('Form submitted successfully', data)
    }
    return (
      <div className="grid gap-8 w-full mx-auto p-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Full width</h2>
          <p className="text-muted-foreground text-sm">Full width with all elements visible</p>
          <AutoForm {...args} logger={logger} onChange={onChange} onSubmit={onSubmit} />
        </div>

        <div className="space-y-2 max-w-xl">
          <h2 className="text-2xl font-bold">XLarge width</h2>
          <p className="text-muted-foreground text-sm">Constrained to ~768px width</p>
          <AutoForm {...args} logger={logger} onChange={onChange} onSubmit={onSubmit} />
        </div>

        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-bold">Medium width</h2>
          <p className="text-muted-foreground text-sm">Constrained to ~448px width</p>
          <AutoForm {...args} logger={logger} onChange={onChange} onSubmit={onSubmit} />
        </div>
      </div>
    )
  },
}
