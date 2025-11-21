import { cn } from '@monorepo/utils'
import { FormControl } from '../atoms/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../atoms/select'
import { getFieldMetadata, getZodEnumOptions } from './auto-form.utils'
import { FormFieldBase, type FormFieldBaseProps } from './form-field'

export function FormFieldSelect({ fieldName, fieldSchema, formData, isOptional, logger, readonly = false }: FormFieldBaseProps) {
  const metadata = getFieldMetadata(fieldSchema)
  if (!metadata) throw new Error(`Field "${fieldName}" is missing metadata (label, placeholder, state)`)
  const { label = '', placeholder, state = 'editable' } = metadata
  const isDisabled = state === 'disabled'
  const options = getZodEnumOptions(fieldSchema)
  if (!options.ok) throw new Error(`Field "${fieldName}" is not an enum`)
  const props = { fieldName, fieldSchema, formData, isOptional, logger, readonly }
  return (
    <FormFieldBase {...props}>
      {field => (
        <FormControl>
          <Select disabled={isDisabled || readonly} name={field.name} onValueChange={field.onChange} value={String(field.value || '')}>
            <SelectTrigger className={cn({ '!opacity-100': readonly })} name={field.name}>
              <SelectValue placeholder={placeholder ?? `Select ${label}`} />
            </SelectTrigger>
            <SelectContent>
              {options.value?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormControl>
      )}
    </FormFieldBase>
  )
}
