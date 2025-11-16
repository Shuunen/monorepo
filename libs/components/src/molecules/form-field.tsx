import type { Logger } from '@monorepo/utils'
import type { ControllerRenderProps } from 'react-hook-form'
import type { z } from 'zod'
import { FormField, FormItem, FormLabel, FormMessage } from '../atoms/form'
import { getFieldMetadata } from './auto-form.utils'

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
  const metadata = getFieldMetadata(fieldSchema)
  if (!metadata) throw new Error(`Field "${fieldName}" is missing metadata (label, placeholder, state)`)
  const { label = '' } = metadata
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
          <FormMessage name={fieldName} />
        </FormItem>
      )}
    />
  )
}
