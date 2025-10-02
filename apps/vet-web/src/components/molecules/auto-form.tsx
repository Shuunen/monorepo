// oxlint-disable max-lines-per-function
/** biome-ignore-all lint/a11y/noLabelWithoutControl: temporary workaround */
/** biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: temporary workaround */
// oxlint-disable id-length
// oxlint-disable no-explicit-any
/** biome-ignore-all lint/suspicious/noExplicitAny: temporary workaround */

import { zodResolver } from '@hookform/resolvers/zod'
import { nbPercentMax } from '@monorepo/utils'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { logger } from '../../utils/logger.utils'

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: formData,
    mode: 'onBlur',
    resolver: zodResolver(currentSchema),
  })

  // Only reset when schema changes, not on every step change
  useEffect(() => {
    reset(formData)
  }, [formData, reset])

  const onStepSubmit = (data: any) => {
    const updatedData = { ...formData, ...data }
    setFormData(updatedData)
    if (onChange) onChange(updatedData)
    if (isLastStep) onSubmit(updatedData)
    else setCurrentStep(prev => prev + 1)
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1)
  }

  const renderField = (fieldName: string, fieldSchema: z.ZodTypeAny) => {
    logger.info('Rendering field', fieldName)
    const metadata = fieldSchema.meta() as { label?: string; placeholder?: string; state?: 'editable' | 'readonly' | 'disabled' } | undefined
    const error = errors[fieldName]
    const isOptional = fieldSchema instanceof z.ZodOptional

    if (!metadata) throw new Error(`Field "${fieldName}" is missing metadata (label, placeholder, state)`)
    const { label = '', placeholder, state = 'editable' } = metadata

    // Readonly state - display as text
    if (state === 'readonly')
      return (
        <div className="mb-4" key={fieldName}>
          <div className="block text-sm font-medium text-gray-700 mb-1">{label}</div>
          <div className="text-gray-900 py-2">{formData[fieldName] || '—'}</div>
        </div>
      )

    const isDisabled = state === 'disabled'

    // Handle different field types
    if (fieldSchema.def?.innerType?.options) {
      const options = fieldSchema.def.innerType.options as string[]
      logger.info('Rendering enum field', fieldName, options)
      return (
        <div className="mb-4" key={fieldName}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {!isOptional && <span className="text-red-500 ml-1">*</span>}
          </label>
          <select {...register(fieldName)} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'} ${isDisabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`} disabled={isDisabled}>
            <option value="">{placeholder || `Select ${label}`}</option>
            {options.map((option: string) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
          {error && <p className="text-red-500 text-sm mt-1">{error.message as string}</p>}
        </div>
      )
    }

    if (fieldSchema instanceof z.ZodNumber)
      return (
        <div className="mb-4" key={fieldName}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {!isOptional && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="number"
            {...register(fieldName, { valueAsNumber: true })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'} ${isDisabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
            disabled={isDisabled}
            placeholder={placeholder}
          />
          {error && <p className="text-red-500 text-sm mt-1">{error.message as string}</p>}
        </div>
      )

    if (fieldSchema instanceof z.ZodBoolean || fieldSchema instanceof z.ZodLiteral) {
      const isLiteral = fieldSchema instanceof z.ZodLiteral
      return (
        <div className="mb-4" key={fieldName}>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" {...register(fieldName)} className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}`} disabled={isDisabled} value={isLiteral ? fieldSchema._def.value : undefined} />
            <span className="text-sm font-medium text-gray-700">
              {label}
              {!isOptional && <span className="text-red-500 ml-1">*</span>}
            </span>
          </label>
          {placeholder && <p className="text-gray-500 text-sm mt-1 ml-6">{placeholder}</p>}
          {error && <p className="text-red-500 text-sm mt-1 ml-6">{error.message as string}</p>}
        </div>
      )
    }

    // Default to text input (string, email, etc.)
    const inputType = fieldSchema instanceof z.ZodString && (fieldSchema._def as any).checks?.some((c: any) => c.kind === 'email') ? 'email' : 'text'

    return (
      <div className="mb-4" key={fieldName}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {!isOptional && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type={inputType}
          {...register(fieldName)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'} ${isDisabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
          disabled={isDisabled}
          placeholder={placeholder}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error.message as string}</p>}
      </div>
    )
  }

  const shape = currentSchema.shape

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <form className="space-y-4" onSubmit={handleSubmit(onStepSubmit)}>
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
        <div className="space-y-4">{Object.keys(shape).map(fieldName => renderField(fieldName, shape[fieldName]))}</div>

        {/* Navigation buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          {currentStep > 0 ? (
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" onClick={handleBack} type="button">
              Back
            </button>
          ) : (
            <div />
          )}

          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" type="submit">
            {isLastStep ? 'Submit' : 'Next'}
          </button>
        </div>
      </form>
    </div>
  )
}
