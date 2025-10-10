import { camelToKebabCase } from '@monorepo/utils'
import { ZodOptional, type z } from 'zod'
import { Checkbox } from '../atoms/checkbox'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../atoms/form'
import { Input } from '../atoms/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../atoms/select'
import { type AutoFormFieldMetadata, checkZodBoolean, checkZodEnum, checkZodNumber, isFieldVisible, readonlyValue } from './auto-form.utils'

// oxlint-disable-next-line max-lines-per-function
export function AutoFormField({ fieldName, fieldSchema, formData, logger }: { fieldName: string; fieldSchema: z.ZodTypeAny; formData: Record<string, unknown>; logger?: { info: (...args: unknown[]) => void } }) {
  if (!isFieldVisible(fieldSchema, formData)) return
  logger?.info('Rendering field', fieldName)
  const metadata = fieldSchema.meta() as AutoFormFieldMetadata | undefined
  if (!metadata) throw new Error(`Field "${fieldName}" is missing metadata (label, placeholder, state)`)
  const { label = '', placeholder, state = 'editable' } = metadata
  const isOptional = fieldSchema instanceof ZodOptional
  const isDisabled = state === 'disabled'
  const testId = camelToKebabCase(fieldName)
  const requiredMark = !isOptional && <span className="text-red-500 ml-1">*</span>
  if (state === 'readonly')
    return (
      <FormItem key={fieldName}>
        <FormLabel>{label}</FormLabel>
        <div className="text-gray-900 py-2" data-testid={testId}>
          {readonlyValue(fieldSchema, formData[fieldName])}
        </div>
      </FormItem>
    )
  const { enumOptions, isEnum } = checkZodEnum(fieldSchema)
  if (isEnum)
    return (
      <FormField
        key={fieldName}
        name={fieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {label}
              {requiredMark}
            </FormLabel>
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
            <FormMessage testId={`${testId}-error`} />
          </FormItem>
        )}
      />
    )
  const { isNumber } = checkZodNumber(fieldSchema)
  if (isNumber)
    return (
      <FormField
        key={fieldName}
        name={fieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {label}
              {requiredMark}
            </FormLabel>
            <FormControl>
              <Input type="number" {...field} disabled={isDisabled} onChange={event => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))} placeholder={placeholder} value={field.value === undefined ? '' : field.value} />
            </FormControl>
            <FormMessage testId={`${testId}-error`} />
          </FormItem>
        )}
      />
    )
  const { booleanLiteralValue, isBoolean, isBooleanLiteral } = checkZodBoolean(fieldSchema)
  if (isBoolean)
    return (
      <FormField
        key={fieldName}
        name={fieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {label}
              {requiredMark}
            </FormLabel>
            <div className="flex gap-2 mt-2">
              <FormControl>{isBooleanLiteral ? <Checkbox {...field} checked={booleanLiteralValue === true} disabled /> : <Checkbox {...field} checked={!!field.value} disabled={isDisabled} onCheckedChange={field.onChange} />}</FormControl>
              {placeholder && <FormDescription>{placeholder}</FormDescription>}
            </div>
            <FormMessage testId={`${testId}-error`} />
          </FormItem>
        )}
      />
    )
  return (
    <FormField
      key={fieldName}
      name={fieldName}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {requiredMark}
          </FormLabel>
          <FormControl>
            <Input {...field} disabled={isDisabled} placeholder={placeholder} />
          </FormControl>
          <FormMessage testId={`${testId}-error`} />
        </FormItem>
      )}
    />
  )
}
