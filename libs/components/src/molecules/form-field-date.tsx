import { FormControl } from '../atoms/form'
import { Input } from '../atoms/input'
import { getFieldMetadata, isZodString } from './auto-form.utils'
import { FormFieldBase, type FormFieldBaseProps } from './form-field'

export function FormFieldDate({ fieldName, fieldSchema, formData, isOptional, logger, readonly = false }: FormFieldBaseProps) {
  const metadata = getFieldMetadata(fieldSchema)
  if (!metadata) throw new Error(`Field "${fieldName}" is missing metadata (label, placeholder, state)`)
  const { placeholder, state = 'editable' } = metadata
  const isDisabled = state === 'disabled'
  const outputString = isZodString(fieldSchema)
  const props = { fieldName, fieldSchema, formData, isOptional, logger, readonly }
  return (
    <FormFieldBase {...props}>
      {field => (
        <FormControl>
          <Input
            {...field}
            disabled={isDisabled}
            onChange={event => {
              const { value } = event.currentTarget
              if (outputString) field.onChange(value)
              else field.onChange(value ? new Date(value) : undefined)
            }}
            placeholder={placeholder}
            readOnly={readonly}
            type="date"
            value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value || ''}
          />
        </FormControl>
      )}
    </FormFieldBase>
  )
}
