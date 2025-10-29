import { camelToKebabCase, type Logger } from '@monorepo/utils'
import type { ControllerRenderProps } from 'react-hook-form'
import type { z } from 'zod'
import { FormField, FormItem, FormLabel, FormMessage } from '../atoms/form'
import type { AutoFormFieldMetadata } from './auto-form.types'

export type FormFieldBaseProps = {
  children?: (field: ControllerRenderProps) => React.ReactNode
  fieldName: string
  fieldSchema: z.ZodTypeAny
  formData: Record<string, unknown>
  isOptional: boolean
  readonly?: boolean
  logger?: Logger
}

export function FormFieldBase(props: FormFieldBaseProps) {
  const { children, fieldName, fieldSchema, isOptional } = props
  const metadata = fieldSchema.meta() as AutoFormFieldMetadata | undefined
  if (!metadata) throw new Error(`Field "${fieldName}" is missing metadata (label, placeholder, state)`)
  const { label = '' } = metadata
  const testId = camelToKebabCase(fieldName)
  const requiredMark = !isOptional && <span className="text-red-500 ml-1">*</span>
  return (
    <FormField
      key={fieldName}
      name={fieldName}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {requiredMark}
          </FormLabel>
          {children?.(field)}
          <FormMessage testId={`${testId}-error`} />
        </FormItem>
      )}
    />
  )
}
