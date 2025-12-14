// oxlint-disable max-lines
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@monorepo/utils";
import { Link } from "@tanstack/react-router";
import { debounce } from "es-toolkit";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "../atoms/button";
import { Form } from "../atoms/form";
import { IconHome } from "../icons/icon-home";
import type { AutoFormProps, AutoFormStepMetadata, AutoFormSubmissionStepProps } from "./auto-form.types";
import { defaultIcons, defaultLabels, filterSchema, getStepMetadata, mapExternalDataToFormFields, normalizeData } from "./auto-form.utils";
import { AutoFormFields } from "./auto-form-fields";
import { AutoFormNavigation } from "./auto-form-navigation";
import { AutoFormStepper, type AutoFormStepperStep } from "./auto-form-stepper";
import { AutoFormSubmissionStep } from "./auto-form-submission-step";
import { AutoFormSummaryStep } from "./auto-form-summary-step";

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
 * @param props.onCancel the function to call when cancel button is clicked
 * @param props.initialData the initial form data
 * @param props.logger optional logger for logging form events
 * @param props.useSummaryStep whether to include a summary step before submission
 * @param props.useSubmissionStep whether to include a submission step after form submission
 * @param props.showButtons whether to show the default form buttons (Next, Back, Submit)
 * @param props.showCard whether to show the form inside a card layout
 * @param props.showLastStep whether to automatically show the last available step on form load
 * @param props.showMenu whether to force show the stepper menu, if undefined shows menu only when multiple steps exist
 * @param props.size the size of the form, can be 'auto', 'small', 'medium' or 'large', default is 'medium', 'auto' adapts to parent content
 * @param props.labels custom labels for form buttons and actions
 * @param props.stepperWidth custom stepper width if needed
 * @returns the AutoForm component
 */
// oxlint-disable-next-line max-lines-per-function
export function AutoForm({ schemas, onSubmit, onChange, onCancel, initialData = {}, logger, useSummaryStep, useSubmissionStep, showButtons = true, showCard, showLastStep, showMenu, size, labels, stepperWidth }: AutoFormProps) {
  const [currentStep, setCurrentStep] = useState(showLastStep ? schemas.length - 1 : 0);
  const [showSummary, setShowSummary] = useState(false);
  const [submissionProps, setSubmissionProps] = useState<AutoFormSubmissionStepProps | undefined>(undefined);
  const defaultValues = useMemo(() => {
    const allMappedData: Record<string, unknown> = {};
    for (const schema of schemas) {
      const schemaMappedData = mapExternalDataToFormFields(schema, initialData);
      Object.assign(allMappedData, schemaMappedData);
    }
    return allMappedData;
  }, [schemas, initialData]);
  const [formData, setFormData] = useState<Record<string, unknown>>(defaultValues);
  const currentSchema = schemas[currentStep];
  const lastAccessibleStepIndex = useMemo(() => {
    for (let index = schemas.length - 1; index >= 0; index -= 1) {
      const stepMeta = getStepMetadata(schemas[index]);
      if (stepMeta?.state !== "upcoming") {
        return index;
      }
    }
    return schemas.length - 1;
  }, [schemas]);
  const isLastStep = currentStep === lastAccessibleStepIndex;
  const finalLabels = { ...defaultLabels, ...labels };
  const form = useForm({ defaultValues, mode: "onBlur", resolver: zodResolver(filterSchema(currentSchema, formData)) });
  // Find a way to reset the form when schema changes.
  // useEffect(() => { form.reset(formData) }, [formData, form])
  // Watch all form values and sync with formData
  const watchedValues = useWatch({ control: form.control });
  // biome-ignore lint/correctness/useExhaustiveDependencies: cannot add all dependencies because it causes infinite loop
  useEffect(() => {
    if (!watchedValues) {
      return;
    }
    void updateFormData();
  }, [watchedValues]);
  /**
   * Update form data state and call onChange callback if provided
   */
  function updateFormDataSync() {
    const updatedData = { ...formData, ...form.getValues() };
    logger?.info("updateFormData", updatedData);
    setFormData(updatedData);
    if (onChange) {
      onChange(normalizeData(schemas, updatedData));
    }
  }
  const updateFormData = debounce(updateFormDataSync, 1);
  /**
   * Handle submission for the current step of a multi-step form
   * @param data partial form values for the current step as a Record<string, unknown>
   * @returns void
   */
  function handleStepSubmit() {
    logger?.info("Step form submitted");
    if (isLastStep && useSummaryStep) {
      setShowSummary(true);
    } else if (isLastStep) {
      void handleFinalSubmit();
    } else {
      setCurrentStep(prev => prev + 1);
      updateFormData();
    }
  }
  /**
   * Handle final submission after all steps are complete
   * @param data the complete form data
   */
  async function handleFinalSubmit() {
    if (!onSubmit) {
      return;
    }
    const cleanedData = normalizeData(schemas, { ...formData, ...form.getValues() });
    logger?.info("Final form submitted", cleanedData);
    const result = await onSubmit(cleanedData);
    if (useSubmissionStep) {
      setSubmissionProps(result.submission);
    }
  }
  // Handle back button
  function handleBack() {
    if (submissionProps) {
      setSubmissionProps(undefined);
    } else if (showSummary) {
      setShowSummary(false);
    } else if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }
  /**
   * Handle step click
   * @param stepIndex the step index
   */
  function handleStepClick(stepIndex: number) {
    if (submissionProps && (submissionProps.status === "success" || submissionProps.status === "warning")) {
      return;
    }
    const stepMeta = getStepMetadata(schemas[stepIndex]);
    if (stepMeta?.state === "upcoming") {
      return;
    }
    if (submissionProps) {
      setSubmissionProps(undefined);
    }
    if (showSummary) {
      setShowSummary(false);
    }
    setCurrentStep(stepIndex);
  }
  // Step states and icons
  let lastSection = "" as AutoFormStepMetadata["section"];
  const steps = schemas.map<AutoFormStepperStep>((schema, idx) => {
    const stepMeta = getStepMetadata(schema);
    const { title = `Step ${idx + 1}`, subtitle, suffix, section: currentSection, state: metaState } = stepMeta ?? {};
    const section = currentSection !== lastSection && currentSection ? currentSection : undefined;
    lastSection = currentSection;
    const state = metaState ?? "editable";
    return {
      active: idx === currentStep,
      icon: defaultIcons[state],
      idx,
      section,
      state,
      subtitle,
      suffix,
      title,
    } satisfies AutoFormStepperStep;
  });
  // Get current step title for rendering above fields
  const currentStepMeta = getStepMetadata(currentSchema);
  const currentStepTitle = currentStepMeta?.title;
  const stepTitle = typeof currentStepTitle === "string" ? currentStepTitle : "";
  const stepState = currentStepMeta?.state;
  const isStepperDisabled = submissionProps?.status === "success";
  const shouldShowStepper = showMenu === undefined ? schemas.length > 1 : showMenu;
  function renderSubmissionContent() {
    if (!submissionProps) {
      return;
    }
    const showBackButton = submissionProps.status === "error" || submissionProps.status === "unknown-error";
    const showHomeButton = submissionProps.status === "success" || submissionProps.status === "warning";
    return (
      <>
        <AutoFormSubmissionStep {...submissionProps} />
        {showBackButton && <AutoFormNavigation centerButton={onCancel ? { onClick: onCancel } : undefined} leftButton={{ onClick: handleBack }} />}
        {showHomeButton && (
          <div className="pt-6">
            <Button asChild name="home">
              <Link search={{ guard: false }} to="/">
                <IconHome /> {finalLabels.homeButton}
              </Link>
            </Button>
          </div>
        )}
      </>
    );
  }
  function renderSummaryContent() {
    return (
      <>
        <AutoFormSummaryStep data={formData} />
        {showButtons && (
          <AutoFormNavigation
            centerButton={onCancel ? { onClick: onCancel } : undefined}
            leftButton={{ onClick: handleBack }}
            rightButton={{
              label: finalLabels.summaryStepButton,
              name: "summary-proceed",
              onClick: handleFinalSubmit,
            }}
          />
        )}
      </>
    );
  }
  function renderFormContent() {
    return (
      <Form {...form}>
        <form onChange={updateFormData} onSubmit={form.handleSubmit(handleStepSubmit)}>
          <AutoFormFields formData={formData} logger={logger} schema={currentSchema} stepState={stepState} stepTitle={stepTitle} />
          {showButtons && (
            <AutoFormNavigation
              centerButton={onCancel ? { onClick: onCancel } : undefined}
              leftButton={currentStep > 0 ? { onClick: handleBack } : undefined}
              rightButton={
                isLastStep
                  ? {
                      label: finalLabels.lastStepButton,
                      name: "last-step-submit",
                      type: "submit",
                    }
                  : { label: finalLabels.nextStep, name: "step-next", type: "submit" }
              }
            />
          )}
        </form>
      </Form>
    );
  }
  function renderContent() {
    if (submissionProps) {
      return renderSubmissionContent();
    }
    if (showSummary) {
      return renderSummaryContent();
    }
    return renderFormContent();
  }
  return (
    <div
      className={cn("mx-auto w-full flex", {
        "min-w-3xl": size === "medium",
        "min-w-5xl": size === "large",
        "min-w-xl": size === "small",
        "p-6 bg-white rounded-lg shadow-md": showCard,
      })}
    >
      {shouldShowStepper && <AutoFormStepper disabled={isStepperDisabled} onStepClick={handleStepClick} steps={steps} width={stepperWidth} />}
      <div className="flex-1 overflow-hidden">{renderContent()}</div>
    </div>
  );
}
