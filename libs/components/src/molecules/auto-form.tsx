import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2Icon, EyeIcon, PencilIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Button } from '../atoms/button'
import { Form } from '../atoms/form'
import { type AutoFormProps, cleanSubmittedData, filterSchema } from './auto-form.utils'
import { AutoFormField } from './auto-form-field'
import { AutoFormStepper } from './auto-form-stepper'

// run this command to check e2e tests `nx run components:test-storybook --skip-nx-cache` and run this command to check unit tests `nx run components:test --skip-nx-cache`

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
  // Step states and icons
  const steps = schemas.map((schema, idx) => {
    const schemaMeta = typeof schema.meta === 'function' ? schema.meta() : undefined
    const label = schemaMeta?.step ? String(schemaMeta.step) : `Step ${idx + 1}`
    // @ts-expect-error type issue
    const allReadonly = Object.values(schema.shape).every((zodField: { meta: () => AutoFormFieldMetadata }) => zodField.meta()?.state === 'readonly')
    const filtered = filterSchema(schema, formData)
    const stepFieldsTouched = Object.keys(schema.shape).some(fieldName => form.formState.touchedFields[fieldName])
    const isStepValid = filtered.safeParse(formData).success
    const isSuccess = isStepValid && stepFieldsTouched
    // oxlint-disable-next-line no-nested-ternary
    const state = allReadonly ? ('readonly' as const) : isSuccess ? ('success' as const) : ('editable' as const)
    // oxlint-disable-next-line no-nested-ternary
    const icon = allReadonly ? <EyeIcon key="eye" /> : isSuccess ? <CheckCircle2Icon key="success" /> : <PencilIcon key="pencil" />
    return {
      active: idx === currentStep,
      icon,
      idx,
      label,
      state,
    }
  })
  // Get current step label for rendering above fields
  const currentStepLabel = (typeof currentSchema.meta === 'function' ? currentSchema.meta()?.step : undefined) ?? undefined
  const stepTitle = typeof currentStepLabel === 'string' ? currentStepLabel : ''
  return (
    <div className="mx-auto p-6 bg-white rounded-lg shadow-md w-full flex">
      {schemas.length > 1 && <AutoFormStepper onStepClick={handleStepClick} steps={steps} />}
      <div className="flex-1">
        <Form {...form}>
          <form onChange={handleChange} onSubmit={form.handleSubmit(handleStepSubmit)}>
            {stepTitle && (
              <h3 className="text-lg font-medium mb-4" data-testid="step-title">
                {stepTitle}
              </h3>
            )}
            <div className="space-y-4">
              {Object.keys(currentSchema.shape).map(fieldName => (
                <AutoFormField fieldName={fieldName} fieldSchema={currentSchema.shape[fieldName] as z.ZodTypeAny} formData={formData} key={fieldName} logger={logger} />
              ))}
            </div>
            <div className="flex justify-between pt-6">
              {currentStep > 0 ? (
                <Button onClick={handleBack} testId="step-back" type="button" variant="outline">
                  Back
                </Button>
              ) : (
                <div />
              )}
              <Button testId={`step-${isLastStep ? 'submit' : 'next'}`} type="submit">
                {isLastStep ? 'Submit' : 'Next'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
