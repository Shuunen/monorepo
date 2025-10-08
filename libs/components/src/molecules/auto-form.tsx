import { zodResolver } from '@hookform/resolvers/zod'
import { nbPercentMax } from '@monorepo/utils'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Button } from '../atoms/button'
import { Form } from '../atoms/form'
import { type AutoFormProps, cleanSubmittedData, filterSchema } from './auto-form.utils'
import { AutoFormField } from './auto-form-field'

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
          <div className="space-y-4">
            {Object.keys(currentSchema.shape).map(fieldName => (
              <AutoFormField
                key={fieldName}
                fieldName={fieldName}
                fieldSchema={currentSchema.shape[fieldName] as z.ZodTypeAny}
                formData={formData}
                logger={logger}
              />
            ))}
          </div>
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
