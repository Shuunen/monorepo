import { zodResolver } from '@hookform/resolvers/zod'
import { camelToKebabCase, nbPercentMax } from '@monorepo/utils'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '../atoms/button'
import { Checkbox } from '../atoms/checkbox'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../atoms/form'
import { Input } from '../atoms/input'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../atoms/select'
// oxlint-disable-next-line max-dependencies
import { type AutoFormFieldMetadata, type AutoFormProps, checkZodBoolean, checkZodEnum, cleanSubmittedData, filterSchema, isFieldVisible, readonlyValue } from './auto-form.utils'

// run this command to check e2e tests  `nx run components:test-storybook --skip-nx-cache`
// run this command to check unit tests `nx run components:test`

// oxlint-disable-next-line max-lines-per-function
export function AutoForm<Type extends z.ZodRawShape>({ schemas, onSubmit, onChange, initialData = {}, logger }: AutoFormProps<Type>) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData)
  const currentSchema = schemas[currentStep]
  const isLastStep = currentStep === schemas.length - 1
  const filteredSchema = useMemo(() => filterSchema(currentSchema, formData), [currentSchema, formData])
  const form = useForm({
    defaultValues: formData,
    mode: 'onBlur',
    resolver: zodResolver(filteredSchema),
  })
  useEffect(() => {
    form.reset(formData)
  }, [formData, form])
  // Remove excluded fields from the submitted data
  const cleanData = useCallback((data: Record<string, unknown>) => cleanSubmittedData(currentSchema, data, formData), [currentSchema, formData])
  // Handle step submission
  function handleStepSubmit(data: Record<string, unknown>) {
    logger?.info('Step form submitted', data)
    const updatedData = { ...formData, ...data }
    if (isLastStep && onSubmit) onSubmit(cleanData(updatedData))
    else setCurrentStep(prev => prev + 1)
  }
  // Handle form change
  function handleChange() {
    const updatedData = { ...formData, ...form.getValues() }
    logger?.info('Form changed', updatedData)
    setFormData(updatedData)
    if (onChange) onChange(cleanData(updatedData))
  }
  // Handle back button
  function handleBack() {
    if (currentStep > 0) setCurrentStep(prev => prev - 1)
  }
  // oxlint-disable-next-line max-lines-per-function
  function renderField(fieldName: string, fieldSchema: z.ZodTypeAny) {
    if (!isFieldVisible(fieldSchema, formData)) return
    logger?.info('Rendering field', fieldName)
    const metadata = fieldSchema.meta() as AutoFormFieldMetadata | undefined
    if (!metadata) throw new Error(`Field "${fieldName}" is missing metadata (label, placeholder, state)`)
    const { label = '', placeholder, state = 'editable' } = metadata
    const isOptional = fieldSchema instanceof z.ZodOptional
    const isDisabled = state === 'disabled'
    const testId = camelToKebabCase(fieldName)
    const requiredMark = !isOptional && <span className="text-red-500 ml-1">*</span>
    // Readonly field - display as text
    if (state === 'readonly')
      return (
        <FormItem key={fieldName}>
          <FormLabel>{label}</FormLabel>
          <div className="text-gray-900 py-2" data-testid={testId}>
            {readonlyValue(fieldSchema, formData[fieldName])}
          </div>
        </FormItem>
      )
    // Enum/Select field
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
                <Select {...field} disabled={isDisabled}>
                  <SelectTrigger testId={`${testId}-trigger`}>{placeholder || `Select ${label}`}</SelectTrigger>
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
    // Number field
    if (fieldSchema instanceof z.ZodNumber)
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
    // Boolean/Checkbox field
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
              <FormControl>{isBooleanLiteral ? <Checkbox {...field} checked={booleanLiteralValue === true} disabled /> : <Checkbox {...field} checked={!!field.value} disabled={isDisabled} onCheckedChange={field.onChange} />}</FormControl>
              {placeholder && <FormDescription>{placeholder}</FormDescription>}
              <FormMessage testId={`${testId}-error`} />
            </FormItem>
          )}
        />
      )
    // String field (default)
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
  // Progress percentage for step indicator
  const progressPercent = ((currentStep + 1) / schemas.length) * nbPercentMax
  return (
    <div className="mx-auto p-6 bg-white rounded-lg shadow-md w-full">
      <Form {...form}>
        <form onChange={handleChange} onSubmit={form.handleSubmit(handleStepSubmit)}>
          {/* Step indicator */}
          {schemas.length > 1 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Step {currentStep + 1} of {schemas.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          )}
          {/* Render fields, skipping controlled fields if controller is not checked */}
          <div className="space-y-4">{Object.keys(currentSchema.shape).map(fieldName => renderField(fieldName, currentSchema.shape[fieldName] as z.ZodTypeAny))}</div>
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
