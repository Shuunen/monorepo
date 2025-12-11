import type { Logger } from '@monorepo/utils'
import type { ControllerRenderProps } from 'react-hook-form'
import type { z } from 'zod'
import { FormField, FormItem, FormMessage } from '../atoms/form'
import { cn } from '../shadcn/utils'
import { getFieldMetadataOrThrow } from './auto-form.utils'
import './form-field.css'
import { FormFieldLabel } from './form-field.utils'

export type FormFieldBaseProps = {
  children?: (field: ControllerRenderProps) => React.ReactNode
  fieldName: string
  fieldSchema: z.ZodTypeAny
  formData: Record<string, unknown>
  isOptional: boolean
  readonly?: boolean
  logger?: Logger
  showLabel?: boolean
}

export function FormFieldBase(props: FormFieldBaseProps) {
  const { children, fieldName, fieldSchema, isOptional } = props
  const metadata = getFieldMetadataOrThrow(fieldName, fieldSchema)
  const indented = metadata.dependsOn !== undefined || metadata.isVisible !== undefined
  return (
    <FormField
      key={fieldName}
      name={fieldName}
      render={({ field }) => (
        <FormItem
          className={cn('py-2 items-start', {
            'indented border-l border-l-2 pl-5': indented,
            'not-indented': !indented,
          })}
        >
          {props.showLabel !== false && <FormFieldLabel isOptional={isOptional} label={metadata.label} />}
          {children?.(field)}
          <FormMessage name={fieldName} />
        </FormItem>
      )}
    />
  )
}
