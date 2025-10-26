import type { Logger } from '@monorepo/utils'
import { z } from 'zod'
import { isFieldVisible, isZodBoolean, isZodEnum, isZodFile, isZodNumber } from './auto-form.utils'
import { FormFieldBoolean } from './form-field-boolean'
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
  const metadata = fieldSchema.meta()
  const state = metadata?.state ?? 'editable'
  const readonly = state === 'readonly'
  const props = { fieldName, fieldSchema, formData, isOptional, logger, readonly }
  if (isZodFile(fieldSchema)) return <FormFieldUpload {...props} />
  if (isZodEnum(fieldSchema)) return <FormFieldSelect {...props} />
  if (isZodNumber(fieldSchema)) return <FormFieldNumber {...props} />
  if (isZodBoolean(fieldSchema)) return <FormFieldBoolean {...props} />
  return <FormFieldText {...props} />
}
