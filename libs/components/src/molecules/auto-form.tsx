import { zodResolver } from '@hookform/resolvers/zod'
import { camelToKebabCase, Logger, nbPercentMax } from '@monorepo/utils'
import { useCallback, useEffect, useMemo, useState } from 'react'
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

type FieldMetadata = { label?: string; placeholder?: string; state?: 'editable' | 'readonly' | 'disabled' }

// oxlint-disable-next-line max-lines-per-function
export function AutoForm<Type extends z.ZodRawShape>({ schemas, onSubmit, onChange, initialData = {}, logger = new Logger() }: AutoFormProps<Type>) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData)
  const currentSchema = schemas[currentStep]
  const shape = currentSchema.shape
  const isLastStep = currentStep === schemas.length - 1
  // Find all controller fields (boolean, start with _ and not _<prefix>_<prefix>)
  const controllerFields = useMemo(
    () =>
      Object.keys(shape).filter(key => {
        if (!key.startsWith('_') || key.slice(1).includes('_')) return false
        const field = shape[key]
        return field instanceof z.ZodBoolean || (field instanceof z.ZodOptional && field._def.innerType instanceof z.ZodBoolean)
      }),
    [shape],
  )
  // Find controller for a given field (e.g., _optional_field → _optional)
  const getControllerForField = useCallback((fieldName: string) => controllerFields.find(ctrl => fieldName.startsWith(`${ctrl}_`)), [controllerFields])
  // Filter schema to only include visible fields
  const filteredSchema = useMemo(() => {
    const visibleShape = {}
    for (const key of Object.keys(shape)) {
      const ctrl = getControllerForField(key)
      if (ctrl && !formData[ctrl]) continue // skip hidden controlled fields
      // @ts-expect-error type issue
      visibleShape[key] = shape[key]
    }
    return z.object(visibleShape)
  }, [shape, formData, getControllerForField])

  const methods = useForm({
    defaultValues: formData,
    mode: 'onBlur',
    // @ts-expect-error type issue with zod and react-hook-form
    resolver: zodResolver(filteredSchema),
  })
  // Only reset when schema changes, not on every step change
  useEffect(() => {
    methods.reset(formData)
  }, [formData, methods])
  // Remove controller fields and strip controller prefixes
  const cleanSubmittedData = useCallback(
    (data: Record<string, unknown>) => {
      const result: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(data)) {
        // Remove controller fields
        if (controllerFields.includes(key)) continue
        // If controlled, only include if controller is true
        const ctrl = getControllerForField(key)
        if (ctrl) {
          if (!data[ctrl]) continue // controller is false/unchecked
          // Remove prefix
          result[key.replace(`${ctrl}_`, '')] = value
        } else result[key] = value
      }
      return result
    },
    [controllerFields, getControllerForField],
  )
  // Handle step submission
  const handleStepSubmit = (data: Record<string, unknown>) => {
    logger.info('Step form submitted', data)
    const updatedData = { ...formData, ...data }
    if (isLastStep && onSubmit) onSubmit(cleanSubmittedData(updatedData))
    else setCurrentStep(prev => prev + 1)
  }
  // Handle form change
  const handleChange = () => {
    const updatedData = { ...formData, ...methods.getValues() }
    logger.info('Form changed', updatedData)
    setFormData(updatedData)
    if (onChange) onChange(cleanSubmittedData(updatedData))
  }
  // Handle back button
  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1)
  }
  // oxlint-disable-next-line max-lines-per-function
  const renderField = (fieldName: string, fieldSchema: z.ZodTypeAny) => {
    const controller = getControllerForField(fieldName)
    if (controller && !formData[controller]) return
    logger.info('Rendering field', fieldName)
    const metadata = fieldSchema.meta() as FieldMetadata | undefined
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
    }
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
      <Form {...methods}>
        <form onChange={handleChange} onSubmit={methods.handleSubmit(handleStepSubmit)}>
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
          <div className="space-y-4">{Object.keys(shape).map(fieldName => renderField(fieldName, shape[fieldName] as z.ZodTypeAny))}</div>
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
