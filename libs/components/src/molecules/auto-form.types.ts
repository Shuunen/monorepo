import type { Logger } from '@monorepo/utils'
import type { ReactNode } from 'react'
import type { z } from 'zod'

/** Props for the AutoForm component, which generates a form based on provided Zod schemas. */
export type AutoFormProps<Type extends z.ZodRawShape> = {
  /** Logger instance for logging form events, for debugging purposes. */
  logger?: Logger
  /** An array of Zod object schemas representing each step of the form. */
  schemas: z.ZodObject<Type>[]
  /** Optional callback function invoked whenever the form data changes, providing the cleaned data. */
  onChange?: (data: Record<string, unknown>) => void
  /** Initial data to pre-fill the form fields. */
  initialData?: Record<string, unknown>
  /** Whether to include a summary step before submission */
  useSummaryStep?: boolean
} & (
  | {
      useSubmissionStep: true
      /** Callback function invoked when the form is submitted, returning the submission step props. */
      onSubmit: (data: Record<string, unknown>) => Promise<{ submission: AutoFormSubmissionStepProps }>
    }
  | {
      useSubmissionStep?: false
      /** Callback function invoked when the form is submitted */
      onSubmit?: (data: Record<string, unknown>) => unknown | Promise<unknown>
    }
)

/**
 * Metadata describing the configuration and behavior of a field in an auto-generated form.
 * example: `z.string().meta({ label: 'First Name', placeholder: 'Enter your first name', state: 'editable' })`
 */
export type AutoFormFieldMetadata = {
  /** The display label for the form field. */
  label?: string
  /** Placeholder text shown in the input when empty. */
  placeholder?: string
  /** The interaction state of the field. */
  state?: 'editable' | 'readonly' | 'disabled'
  /** The name of another field that this field depends on. */
  dependsOn?: string
  /** Whether the field should be excluded from the form. */
  excluded?: boolean
  /** An optional step name if the form is multi-step. */
  step?: string
  /** Key mapping for both input and output data. Equivalent to setting both keyIn and keyOut. */
  key?: string
  /** Key to map initial data input. Used when loading data from external sources. */
  keyIn?: string
  /** Key to map submitted data output. Used when submitting data to external sources. */
  keyOut?: string
  /** Custom options for select/enum fields with label/value pairs. */
  options?: SelectOption[]
}

/** Option for select/enum fields in the auto-generated form. */
export type SelectOption = {
  /** The display label for the option, like "United States" */
  label: string
  /** The actual value for the option, like "US" */
  value: string
}

/** Props for the AutoFormSubmissionStep component, which displays the submission status of the form. */
export type AutoFormSubmissionStepProps = {
  /** The message or content to display in the step, could be a paragraph for example. */
  children: ReactNode
  /** Custom labels for different statuses */
  labels?: {
    loading?: string
    success?: string
    warning?: string
    error?: string
  }
  /** A list of details to add to the status message */
  detailsList?: string[]
  /** The actual status of the submission */
  status: 'loading' | 'success' | 'warning' | 'error' | 'unknown-error'
  /** A list of details to add to a tooltip to give some context to the user */
  tooltipDetailsList?: string[]
}
