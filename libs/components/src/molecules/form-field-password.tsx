import { FormControl } from '../atoms/form'
import { Input } from '../atoms/input'
import { getFieldMetadata } from './auto-form.utils'
import { FormFieldBase, type FormFieldBaseProps } from './form-field'

export function FormFieldPassword({ fieldName, fieldSchema, formData, isOptional, logger, readonly = false }: FormFieldBaseProps) {
  const metadata = getFieldMetadata(fieldSchema)
  if (!metadata) throw new Error(`Field "${fieldName}" is missing metadata (label, placeholder, state)`)
  const { placeholder, state = 'editable' } = metadata
  const isDisabled = state === 'disabled'
  const props = { fieldName, fieldSchema, formData, isOptional, logger, readonly }
  return (
    <FormFieldBase {...props}>
      {field => (
        <FormControl>
          <Input {...field} disabled={isDisabled} placeholder={placeholder} readOnly={readonly} type="password" value={field.value || ''} />
        </FormControl>
      )}
    </FormFieldBase>
  )
}
