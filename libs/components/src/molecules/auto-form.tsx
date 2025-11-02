import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@monorepo/utils'
import { Link } from '@tanstack/react-router'
import { type MouseEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { z } from 'zod'
import { Button } from '../atoms/button'
import { Form } from '../atoms/form'
import { IconEdit } from '../icons/icon-edit'
import { IconHome } from '../icons/icon-home'
import { IconReadonly } from '../icons/icon-readonly'
import { IconSuccess } from '../icons/icon-success'
import type { AutoFormProps, AutoFormSubmissionStepProps } from './auto-form.types'
import { cleanSubmittedData, defaultLabels, filterSchema, mapExternalDataToFormFields } from './auto-form.utils'
import { AutoFormFields } from './auto-form-fields'
import { AutoFormNavigation } from './auto-form-navigation'
import { AutoFormStepper } from './auto-form-stepper'
import { AutoFormSubmissionStep } from './auto-form-submission-step'
import { AutoFormSummaryStep } from './auto-form-summary-step'

// run this command to check e2e tests `nx run components:test-storybook --skip-nx-cache` and run this command to check unit tests `nx run components:test --skip-nx-cache`

/**
 * AutoForm is a black box, all in one form generator, takes Zod schemas in and build the ui, handle validation, state management, navigation, submission, etc.:
 *  - AutoFormStepper : display the vertical menu on the left with the steps and their states (editable, readonly, completed, error)
 *  - AutoFormFields : display the fields of the current step
 *  - AutoFormNavigation : display the navigation buttons (next, back, submit)
 *  - AutoFormSummaryStep : display a summary of the data to be submitted and ask for confirmation
 *  - AutoFormSubmissionStep : display the submission state (submitting, success, error)
 * @param props the AutoForm props
 * @param props.schemas the Zod schemas for each step
 * @param props.onSubmit the function to call on form submission after summary confirmation
 * @param props.onChange the function to call on form data change
 * @param props.initialData the initial form data
 * @param props.logger optional logger for logging form events
 * @param props.useSummaryStep whether to include a summary step before submission
 * @param props.useSubmissionStep whether to include a submission step after form submission
 * @param props.showCard whether to show the form inside a card layout
 * @param props.labels custom labels for form buttons and actions
 * @returns the AutoForm component
 */
// oxlint-disable-next-line max-lines-per-function
export function AutoForm<Type extends z.ZodRawShape>({ schemas, onSubmit, onChange, initialData = {}, logger, useSummaryStep = false, useSubmissionStep = false, showCard = true, labels }: AutoFormProps<Type>) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showSummary, setShowSummary] = useState(false)
  const [submissionProps, setSubmissionProps] = useState<AutoFormSubmissionStepProps | undefined>(undefined)
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
  const finalLabels = { ...defaultLabels, ...labels }
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

  /**
   * Handle submission for the current step of a multi-step form
   * @param data partial form values for the current step as a Record<string, unknown>
   * @returns void
   */
  function handleStepSubmit(data: Record<string, unknown>) {
    logger?.info('Step form submitted', data)
    const updatedData = { ...formData, ...data }
    if (isLastStep && useSummaryStep) setShowSummary(true)
    else if (isLastStep) void handleFinalSubmit(updatedData)
    else setCurrentStep(prev => prev + 1)
  }
  /**
   * Handle final submission after all steps are complete
   * @param data the complete form data
   */
  async function handleFinalSubmit(data: Record<string, unknown>) {
    const cleanedData = cleanData(data)
    if (!onSubmit) return
    if (useSubmissionStep) {
      const result = await onSubmit(cleanedData)
      if (result?.submission) setSubmissionProps(result.submission)
    } else await onSubmit(cleanedData)
  }
  /**
   * Handle proceed button click in summary step
   */
  function handleSummaryProceed() {
    void handleFinalSubmit(formData)
  }
  /**
   * Handle form data change
   */
  function handleChange() {
    const updatedData = { ...formData, ...form.getValues() }
    logger?.info('Form changed', updatedData)
    setFormData(updatedData)
    if (onChange) onChange(cleanData(updatedData))
  }
  /**
   * Handle next button click
   * @param event optional mouse event
   */
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
    if (submissionProps) setSubmissionProps(undefined)
    else if (showSummary) setShowSummary(false)
    else if (currentStep > 0) setCurrentStep(prev => prev - 1)
  }
  /**
   * Handle step click
   * @param stepIndex the step index
   */
  function handleStepClick(stepIndex: number) {
    if (submissionProps && (submissionProps.status === 'success' || submissionProps.status === 'warning')) return
    if (submissionProps) setSubmissionProps(undefined)
    if (showSummary) setShowSummary(false)
    setCurrentStep(stepIndex)
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
  const isStepperDisabled = submissionProps?.status === 'success'
  function renderContent() {
    if (submissionProps) {
      const showBackButton = submissionProps.status === 'error' || submissionProps.status === 'unknown-error'
      const showHomeButton = submissionProps.status === 'success' || submissionProps.status === 'warning'
      return (
        <>
          <AutoFormSubmissionStep {...submissionProps} />
          {showBackButton && <AutoFormNavigation leftButton={{ disabled: false, onClick: handleBack }} />}
          {showHomeButton && (
            <div className="pt-6">
              <Button asChild testId="btn-home">
                <Link search={{ guard: false }} to="/">
                  <IconHome /> {finalLabels.homeButton}
                </Link>
              </Button>
            </div>
          )}
        </>
      )
    }
    if (showSummary)
      return (
        <>
          <AutoFormSummaryStep data={cleanData(formData)} />
          <AutoFormNavigation leftButton={{ disabled: false, onClick: handleBack }} rightButton={{ disabled: false, label: finalLabels.summaryStepButton, onClick: handleSummaryProceed, testId: 'summary-proceed' }} />
        </>
      )
    return (
      <Form {...form}>
        <form onChange={handleChange} onSubmit={form.handleSubmit(handleStepSubmit)}>
          <AutoFormFields formData={formData} logger={logger} schema={currentSchema} stepTitle={stepTitle} />
          <AutoFormNavigation
            leftButton={currentStep > 0 ? { disabled: false, onClick: handleBack } : undefined}
            rightButton={isLastStep ? { disabled: isSubmitDisabled, label: finalLabels.lastStepButton, testId: 'last-step-submit', type: 'submit' } : { disabled: false, label: finalLabels.nextStep, onClick: handleNext, testId: 'step-next' }}
          />
        </form>
      </Form>
    )
  }
  return (
    <div className={cn('mx-auto w-full flex min-w-2xl', { 'p-6 bg-white rounded-lg shadow-md': showCard })}>
      {schemas.length > 1 && <AutoFormStepper disabled={isStepperDisabled} onStepClick={handleStepClick} steps={steps} />}
      <div className="flex-1">{renderContent()}</div>
    </div>
  )
}
