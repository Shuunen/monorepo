// oxlint-disable max-lines-per-function
/** biome-ignore-all lint/a11y/noLabelWithoutControl: temporary workaround */
/** biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: temporary workaround */
// oxlint-disable id-length
// oxlint-disable no-explicit-any
/** biome-ignore-all lint/suspicious/noExplicitAny: temporary workaround */

import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Checkbox, Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Input, Select, SelectContent, SelectItem, SelectTrigger } from '@monorepo/components'
import { nbPercentMax } from '@monorepo/utils'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { logger } from '../../utils/logger.utils'
import { checkZodEnum } from './auto-form.utils'

// oxlint-disable-next-line consistent-type-definitions
interface AutoFormProps<T extends z.ZodRawShape> {
  schemas: z.ZodObject<T>[]
  onSubmit: (data: any) => void
  onChange?: (data: any) => void
  initialData?: Partial<any>
}

// oxlint-disable-next-line max-lines-per-function
export function AutoForm<T extends z.ZodRawShape>({ schemas, onSubmit, onChange, initialData = {} }: AutoFormProps<T>) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, any>>(initialData)

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

  const onStepSubmit = (data: any) => {
    logger.info('Step form submitted', data)
    const updatedData = { ...formData, ...data }
    if (isLastStep) onSubmit(updatedData)
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
          <div className="text-gray-900 py-2">{formData[fieldName] || '—'}</div>
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
                  <SelectTrigger>{placeholder || `Select ${label}`}</SelectTrigger>
                  <SelectContent>
                    {enumOptions?.map(option => (
                      <SelectItem key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
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
              <FormMessage />
            </FormItem>
          )}
        />
      )
    // Boolean/checkbox
    if (fieldSchema instanceof z.ZodBoolean || fieldSchema instanceof z.ZodLiteral)
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
                <Checkbox {...field} defaultChecked={field.value} disabled={isDisabled} />
              </FormControl>
              {placeholder && <FormDescription>{placeholder}</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />
      )
    // String/email/textarea
    const inputType = fieldSchema instanceof z.ZodString && (fieldSchema._def as any).checks?.some((c: any) => c.kind === 'email') ? 'email' : 'text'

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
              <Input type={inputType} {...field} disabled={isDisabled} placeholder={placeholder} />
            </FormControl>
            <FormMessage />
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
          <div className="space-y-4">{Object.keys(shape).map(fieldName => renderField(fieldName, shape[fieldName] as any))}</div>
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
