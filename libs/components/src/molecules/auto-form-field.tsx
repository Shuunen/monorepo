import { z } from 'zod'
import { checkZodBoolean, checkZodEnum, checkZodNumber, isFieldVisible } from './auto-form.utils'
import { FormFieldBoolean } from './form-field-boolean'
import { FormFieldNumber } from './form-field-number'
import { FormFieldSelect } from './form-field-select'
import { FormFieldText } from './form-field-text'

export function AutoFormField({ fieldName, fieldSchema, formData, logger }: { fieldName: string; fieldSchema: z.ZodTypeAny; formData: Record<string, unknown>; logger?: { info: (...args: unknown[]) => void } }) {
  if (!isFieldVisible(fieldSchema, formData)) return
  logger?.info('Rendering field', fieldName)
  const isOptional = fieldSchema instanceof z.ZodOptional
  const metadata = fieldSchema.meta()
  const state = metadata?.state ?? 'editable'
  const readonly = state === 'readonly'
  const props = { fieldName, fieldSchema, formData, isOptional, logger, readonly }
  const { isEnum } = checkZodEnum(fieldSchema as z.ZodEnum | z.ZodOptional<z.ZodEnum>)
  if (isEnum) return <FormFieldSelect {...props} />
  const { isNumber } = checkZodNumber(fieldSchema as z.ZodNumber | z.ZodOptional<z.ZodNumber>)
  if (isNumber) return <FormFieldNumber {...props} />
  const { isBoolean } = checkZodBoolean(fieldSchema as z.ZodBoolean | z.ZodLiteral | z.ZodOptional<z.ZodBoolean>)
  if (isBoolean) return <FormFieldBoolean {...props} />
  return <FormFieldText {...props} />
}
