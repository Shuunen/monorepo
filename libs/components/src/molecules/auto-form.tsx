import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Button } from '../atoms/button'
import { Form } from '../atoms/form'
import { type AutoFormProps, cleanSubmittedData, filterSchema } from './auto-form.utils'
import { AutoFormField } from './auto-form-field'
import { Stepper } from './auto-form-stepper'

// run this command to check e2e tests `nx run components:test-storybook --skip-nx-cache` and run this command to check unit tests `nx run components:test`

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
  // Handle stepper click
  function handleStepClick(idx: number) {
    setCurrentStep(idx)
  }
  // Step labels (try to use schema meta label, fallback to Step N)
  const stepLabels = schemas.map((schema, idx) => {
    const shape = schema.shape
    const firstField = Object.keys(shape)[0]
    // @ts-expect-error type issue
    const meta = shape[firstField].meta()
    return meta.step ?? meta.label ?? `Step ${idx + 1}`
  })
  return (
    <div className="mx-auto p-6 bg-white rounded-lg shadow-md w-full flex">
      {schemas.length > 1 && <Stepper currentStep={currentStep} onStepClick={handleStepClick} steps={stepLabels} />}
      <div className="flex-1">
        <Form {...form}>
          <form onChange={handleChange} onSubmit={form.handleSubmit(handleStepSubmit)}>
            <div className="space-y-4">
              {Object.keys(currentSchema.shape).map(fieldName => (
                <AutoFormField fieldName={fieldName} fieldSchema={currentSchema.shape[fieldName] as z.ZodTypeAny} formData={formData} key={fieldName} logger={logger} />
              ))}
            </div>
            <div className="flex justify-between pt-6">
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
    </div>
  )
}
