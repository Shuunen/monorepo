import type { z } from 'zod'
import { FormControl } from '../atoms/form'
import { Input } from '../atoms/input'
import { type AutoFormFieldMetadata, checkZodNumber } from './auto-form.utils'
import { FormFieldBase, type FormFieldBaseProps } from './form-field'

export function FormFieldNumber({ fieldName, fieldSchema, formData, isOptional, logger, readonly = false }: FormFieldBaseProps) {
  const metadata = fieldSchema.meta() as AutoFormFieldMetadata | undefined
  if (!metadata) throw new Error(`Field "${fieldName}" is missing metadata (label, placeholder, state)`)
  const { placeholder, state = 'editable' } = metadata
  const isDisabled = state === 'disabled'
  const { isNumber } = checkZodNumber(fieldSchema as z.ZodNumber | z.ZodOptional<z.ZodNumber>)
  if (!isNumber) throw new Error(`Field "${fieldName}" is not a number`)
  const props = { fieldName, fieldSchema, formData, isOptional, logger, readonly }
  return (
    <FormFieldBase {...props}>
      {field => (
        <FormControl>
          <Input type="number" {...field} disabled={isDisabled} onChange={event => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))} placeholder={placeholder} value={field.value === undefined ? '' : field.value} />
        </FormControl>
      )}
    </FormFieldBase>
  )
}
