import type { Logger } from '@monorepo/utils'
import { z } from 'zod'
import { Alert } from '../atoms/alert'
import { getFieldMetadata, getFormFieldRender, isFieldVisible } from './auto-form.utils'
import { FormFieldBoolean } from './form-field-boolean'
import { FormFieldDate } from './form-field-date'
import { FormFieldNumber } from './form-field-number'
import { FormFieldSelect } from './form-field-select'
import { FormFieldText } from './form-field-text'
import { FormFieldUpload } from './form-field-upload'

type AutoFormFieldProps = {
  fieldName: string
  fieldSchema: z.ZodTypeAny
  formData: Record<string, unknown>
  logger?: Logger
}

export function AutoFormField({ fieldName, fieldSchema, formData, logger }: AutoFormFieldProps) {
  if (!isFieldVisible(fieldSchema, formData)) return
  logger?.info('Rendering field', fieldName)
  const isOptional = fieldSchema instanceof z.ZodOptional
  const { state = 'editable' } = getFieldMetadata(fieldSchema) ?? {}
  const props = { fieldName, fieldSchema, formData, isOptional, logger, readonly: state === 'readonly' }
  const render = getFormFieldRender(fieldSchema)
  if (render === 'upload') return <FormFieldUpload {...props} />
  if (render === 'date') return <FormFieldDate {...props} />
  if (render === 'select') return <FormFieldSelect {...props} />
  if (render === 'number') return <FormFieldNumber {...props} />
  if (render === 'boolean') return <FormFieldBoolean {...props} />
  if (render === 'text') return <FormFieldText {...props} />
  return <Alert title={`Missing render for field "${fieldName}"`} type="error" />
}
