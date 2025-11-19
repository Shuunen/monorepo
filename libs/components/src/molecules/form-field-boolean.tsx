import type { z } from 'zod'
import { FormControl, FormDescription } from '../atoms/form'
import { Switch } from '../atoms/switch'
import { checkZodBoolean, getFieldMetadata } from './auto-form.utils'
import { FormFieldBase, type FormFieldBaseProps } from './form-field'

export function FormFieldBoolean({ fieldName, fieldSchema, formData, isOptional, logger, readonly = false }: FormFieldBaseProps) {
  const metadata = getFieldMetadata(fieldSchema)
  if (!metadata) throw new Error(`Field "${fieldName}" is missing metadata (label, placeholder, state)`)
  const { placeholder, state = 'editable' } = metadata
  const isDisabled = state === 'disabled' || readonly
  const { booleanLiteralValue, isBoolean, isBooleanLiteral } = checkZodBoolean(fieldSchema as z.ZodBoolean | z.ZodLiteral | z.ZodOptional<z.ZodBoolean>)
  if (!isBoolean) throw new Error(`Field "${fieldName}" is not a boolean`)
  const props = { fieldName, fieldSchema, formData, isOptional, logger, readonly }
  return (
    <FormFieldBase {...props}>
      {field => (
        <div className="flex gap-2 mt-2">
          <FormControl>{isBooleanLiteral ? <Switch {...field} checked={booleanLiteralValue === true} disabled /> : <Switch {...field} checked={!!field.value} disabled={isDisabled} onCheckedChange={field.onChange} />}</FormControl>
          {placeholder && <FormDescription name={fieldName}>{placeholder}</FormDescription>}
        </div>
      )}
    </FormFieldBase>
  )
}
