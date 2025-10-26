import { zodResolver } from '@hookform/resolvers/zod'
import { type MouseEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { z } from 'zod'
import { Form } from '../atoms/form'
import { IconEdit } from '../icons/icon-edit'
import { IconReadonly } from '../icons/icon-readonly'
import { IconSuccess } from '../icons/icon-success'
import { type AutoFormProps, cleanSubmittedData, filterSchema, mapExternalDataToFormFields } from './auto-form.utils'
import { AutoFormFields } from './auto-form-fields'
import { AutoFormNavigation } from './auto-form-navigation'
import { AutoFormStepper } from './auto-form-stepper'

// run this command to check e2e tests `nx run components:test-storybook --skip-nx-cache` and run this command to check unit tests `nx run components:test --skip-nx-cache`

// oxlint-disable-next-line max-lines-per-function
export function AutoForm<Type extends z.ZodRawShape>({ schemas, onSubmit, onChange, initialData = {}, logger }: AutoFormProps<Type>) {
  const [currentStep, setCurrentStep] = useState(0)
  const mappedInitialData = useMemo(() => {
    const allMappedData: Record<string, unknown> = {}
    for (const schema of schemas) {
      const schemaMappedData = mapExternalDataToFormFields(schema, initialData)
      Object.assign(allMappedData, schemaMappedData)
    }
    return allMappedData
  }, [schemas, initialData])
  const [formData, setFormData] = useState<Record<string, unknown>>(mappedInitialData)
  const currentSchema = schemas[currentStep]
  const isLastStep = currentStep === schemas.length - 1
  const filteredSchema = useMemo(() => filterSchema(currentSchema, formData), [currentSchema, formData])
  const form = useForm({
    defaultValues: formData,
    mode: 'onBlur',
    resolver: zodResolver(filteredSchema),
  })
  // Find a way to reset the form when schema changes.
  // useEffect(() => {
  //   form.reset(formData)
  // }, [formData, form])
  // Remove excluded fields from the submitted data
  const cleanData = useCallback((data: Record<string, unknown>) => cleanSubmittedData(currentSchema, data, formData), [currentSchema, formData])
  // Watch all form values and sync with formData
  const watchedValues = useWatch({ control: form.control })
  // biome-ignore lint/correctness/useExhaustiveDependencies: cannot add all dependencies because it causes infinite loop
  useEffect(() => {
    if (!watchedValues) return
    const updatedData = { ...formData, ...watchedValues }
    setFormData(updatedData)
    if (onChange) onChange(cleanData(updatedData))
  }, [watchedValues])
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
  // Handle next button (bypass validation)
  function handleNext(event?: MouseEvent) {
    event?.preventDefault() // Prevent any default button behavior
    const currentValues = form.getValues()
    const updatedData = { ...formData, ...currentValues }
    setFormData(updatedData)
    if (onChange) onChange(cleanData(updatedData))
    setCurrentStep(prev => prev + 1)
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
    const allReadonly = Object.values(schema.shape).every(
      // @ts-expect-error type issue
      (zodField: { meta: () => AutoFormFieldMetadata }) => zodField.meta()?.state === 'readonly',
    )
    const filtered = filterSchema(schema, formData)
    const stepFieldsTouched = Object.keys(schema.shape).some(fieldName => form.formState.touchedFields[fieldName])
    const isStepValid = filtered.safeParse(formData).success
    const isSuccess = isStepValid && stepFieldsTouched
    /* oxlint-disable no-nested-ternary */
    const state = allReadonly ? ('readonly' as const) : isSuccess ? ('success' as const) : ('editable' as const)
    const icon = allReadonly ? <IconReadonly key="readonly" /> : isSuccess ? <IconSuccess key="success" /> : <IconEdit key="editable" />
    /* oxlint-enable no-nested-ternary */
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
  // Check if all schemas are valid to enable/disable submit button
  const isFormValid = useMemo(
    () =>
      schemas.every(schema => {
        const filtered = filterSchema(schema, formData)
        return filtered.safeParse(formData).success
      }),
    [schemas, formData],
  )
  const isSubmitDisabled = !isFormValid
  return (
    <div className="mx-auto p-6 bg-white rounded-lg shadow-md w-full flex">
      {schemas.length > 1 && <AutoFormStepper onStepClick={handleStepClick} steps={steps} />}
      <div className="flex-1">
        <Form {...form}>
          <form onChange={handleChange} onSubmit={form.handleSubmit(handleStepSubmit)}>
            <AutoFormFields formData={formData} logger={logger} schema={currentSchema} stepTitle={stepTitle} />
            <AutoFormNavigation currentStep={currentStep} isLastStep={isLastStep} isSubmitDisabled={isSubmitDisabled} onBack={handleBack} onNext={handleNext} />
          </form>
        </Form>
      </div>
    </div>
  )
}
