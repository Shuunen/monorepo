import { zodResolver } from '@hookform/resolvers/zod'
import { camelToKebabCase, Logger, nbPercentMax } from '@monorepo/utils'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '../atoms/button'
import { Checkbox } from '../atoms/checkbox'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../atoms/form'
import { Input } from '../atoms/input'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../atoms/select'
import { checkZodBoolean, checkZodEnum, readonlyValue } from './auto-form.utils'

// oxlint-disable-next-line consistent-type-definitions
export interface AutoFormProps<Type extends z.ZodRawShape> {
  logger?: Logger
  schemas: z.ZodObject<Type>[]
  onSubmit?: (data: Record<string, unknown>) => void
  onChange?: (data: Record<string, unknown>) => void
  initialData?: Record<string, unknown>
}

// oxlint-disable-next-line max-lines-per-function
export function AutoForm<Type extends z.ZodRawShape>({ schemas, onSubmit, onChange, initialData = {}, logger = new Logger() }: AutoFormProps<Type>) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData)

  const currentSchema = schemas[currentStep]
  const isLastStep = currentStep === schemas.length - 1

  const methods = useForm({
    defaultValues: formData,
    mode: 'onBlur',
    // @ts-expect-error type issue
    resolver: zodResolver(currentSchema),
  })
  const { handleSubmit, reset, getValues } = methods

  // Only reset when schema changes, not on every step change
  useEffect(() => {
    reset(formData)
  }, [formData, reset])

  const onStepSubmit = (data: Record<string, unknown>) => {
    logger.info('Step form submitted', data)
    const updatedData = { ...formData, ...data }
    if (isLastStep && onSubmit) onSubmit(updatedData)
    else setCurrentStep(prev => prev + 1)
  }

  function handleChange() {
    const updatedData = { ...formData, ...getValues() }
    logger.info('Form changed', updatedData)
    setFormData(updatedData)
    if (onChange) onChange(updatedData)
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1)
  }

  // oxlint-disable-next-line max-lines-per-function
  const renderField = (fieldName: string, fieldSchema: z.ZodTypeAny) => {
    logger.info('Rendering field', fieldName)
    const metadata = fieldSchema.meta() as { label?: string; placeholder?: string; state?: 'editable' | 'readonly' | 'disabled' } | undefined
    const isOptional = fieldSchema instanceof z.ZodOptional
    if (!metadata) throw new Error(`Field "${fieldName}" is missing metadata (label, placeholder, state)`)
    const { label = '', placeholder, state = 'editable' } = metadata
    const isDisabled = state === 'disabled'
    // Readonly state - display as text
    if (state === 'readonly')
      return (
        <FormItem key={fieldName}>
          <FormLabel>{label}</FormLabel>
          <div className="text-gray-900 py-2" data-testid={camelToKebabCase(fieldName)}>
            {readonlyValue(fieldSchema, formData[fieldName])}
          </div>
        </FormItem>
      )
    // Enum/select
    const { enumOptions, isEnum } = checkZodEnum(fieldSchema)
    if (isEnum) {
      logger.info('Rendering enum field', fieldName, enumOptions)
      return (
        <FormField
          key={fieldName}
          name={fieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {label}
                {!isOptional && <span className="text-red-500 ml-1">*</span>}
              </FormLabel>
              <FormControl>
                <Select {...field} disabled={isDisabled}>
                  <SelectTrigger testId={`${camelToKebabCase(fieldName)}-trigger`}>{placeholder || `Select ${label}`}</SelectTrigger>
                  <SelectContent>
                    {enumOptions?.map(option => (
                      <SelectItem key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage testId={`${camelToKebabCase(fieldName)}-error`} />
            </FormItem>
          )}
        />
      )
    }
    // Number
    if (fieldSchema instanceof z.ZodNumber)
      return (
        <FormField
          key={fieldName}
          name={fieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {label}
                {!isOptional && <span className="text-red-500 ml-1">*</span>}
              </FormLabel>
              <FormControl>
                <Input type="number" {...field} disabled={isDisabled} placeholder={placeholder} />
              </FormControl>
              <FormMessage testId={`${camelToKebabCase(fieldName)}-error`} />
            </FormItem>
          )}
        />
      )
    // Boolean/checkbox
    const { booleanLiteralValue, isBoolean, isBooleanLiteral: isLiteral } = checkZodBoolean(fieldSchema)
    if (isBoolean)
      return (
        <FormField
          key={fieldName}
          name={fieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {label}
                {!isOptional && <span className="text-red-500 ml-1">*</span>}
              </FormLabel>
              <FormControl>{isLiteral ? <Checkbox {...field} checked={booleanLiteralValue === true} disabled /> : <Checkbox {...field} checked={!!field.value} disabled={isDisabled} onCheckedChange={val => field.onChange(val)} />}</FormControl>
              {placeholder && <FormDescription>{placeholder}</FormDescription>}
              <FormMessage testId={`${camelToKebabCase(fieldName)}-error`} />
            </FormItem>
          )}
        />
      )
    // String/email/textarea
    return (
      <FormField
        key={fieldName}
        name={fieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {label}
              {!isOptional && <span className="text-red-500 ml-1">*</span>}
            </FormLabel>
            <FormControl>
              <Input {...field} disabled={isDisabled} placeholder={placeholder} />
            </FormControl>
            <FormMessage testId={`${camelToKebabCase(fieldName)}-error`} />
          </FormItem>
        )}
      />
    )
  }

  const shape = currentSchema.shape

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <Form {...methods}>
        <form onChange={handleChange} onSubmit={handleSubmit(onStepSubmit)}>
          {/* Step indicator */}
          {schemas.length > 1 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Step {currentStep + 1} of {schemas.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${((currentStep + 1) / schemas.length) * nbPercentMax}%` }} />
              </div>
            </div>
          )}
          {/* Render fields */}
          {/** biome-ignore lint/suspicious/noExplicitAny: fix me */}
          <div className="space-y-4">{Object.keys(shape).map(fieldName => renderField(fieldName, shape[fieldName] as any) /* oxlint-disable-line no-explicit-any */)}</div>
          {/* Navigation buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            {currentStep > 0 ? (
              <Button onClick={handleBack} type="button" variant="outline">
                Back
              </Button>
            ) : (
              <div />
            )}
            <Button type="submit">{isLastStep ? 'Submit' : 'Next'}</Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
