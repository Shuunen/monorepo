import { camelToKebabCase } from '@monorepo/utils'
import type { z } from 'zod'
import { FormControl } from '../atoms/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../atoms/select'
import { type AutoFormFieldMetadata, checkZodEnum } from './auto-form.utils'
import { FormFieldBase, type FormFieldBaseProps } from './form-field'

export function FormFieldSelect({ fieldName, fieldSchema, formData, isOptional, logger, readonly = false }: FormFieldBaseProps) {
  const metadata = fieldSchema.meta() as AutoFormFieldMetadata | undefined
  if (!metadata) throw new Error(`Field "${fieldName}" is missing metadata (label, placeholder, state)`)
  const { label = '', placeholder, state = 'editable' } = metadata
  const isDisabled = state === 'disabled'
  const testId = camelToKebabCase(fieldName)
  const { enumOptions, isEnum } = checkZodEnum(fieldSchema as z.ZodEnum | z.ZodOptional<z.ZodEnum>)
  if (!isEnum) throw new Error(`Field "${fieldName}" is not an enum`)
  const props = { fieldName, fieldSchema, formData, isOptional, logger, readonly }
  return (
    <FormFieldBase {...props}>
      {field => (
        <FormControl>
          <Select {...field} disabled={isDisabled} onValueChange={field.onChange}>
            <SelectTrigger testId={`${testId}-trigger`}>
              <SelectValue placeholder={placeholder || `Select ${label}`} />
            </SelectTrigger>
            <SelectContent>
              {enumOptions?.map(option => (
                <SelectItem key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormControl>
      )}
    </FormFieldBase>
  )
}
