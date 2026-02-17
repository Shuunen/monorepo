// oxlint-disable max-lines
import { zodResolver } from "@hookform/resolvers/zod";
import { cn, nbPercentMax, scrollToElement, sleep } from "@monorepo/utils";
import { Link } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../atoms/button";
import { Form } from "../atoms/form";
import { IconArrowLeft } from "../icons/icon-arrow-left";
import { IconHome } from "../icons/icon-home";
import { AutoFormFields } from "./auto-form-fields";
import { AutoFormNavigation } from "./auto-form-navigation";
import { AutoFormStepper } from "./auto-form-stepper";
import { AutoFormSubmissionStep } from "./auto-form-submission-step";
import { AutoFormSummaryStep } from "./auto-form-summary-step";
import { defaultIcons, defaultLabels } from "./auto-form.const";
import type {
  AutoFormData,
  AutoFormProps,
  AutoFormSubformOptions,
  AutoFormSubmissionStepProps,
} from "./auto-form.types";
import {
  buildStepperSteps,
  filterSchema,
  getDefaultValues,
  getInitialStep,
  getLastAccessibleStepIndex,
  getStepMetadata,
  hasCustomErrors,
  isStepClickable,
  normalizeData,
} from "./auto-form.utils";

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
 * @param props.onCancel the function to call when cancel button is clicked
 * @param props.initialData the initial form data
 * @param props.logger optional logger for logging form events
 * @param props.useSummaryStep whether to include a summary step before submission
 * @param props.useSubmissionStep whether to include a submission step after form submission
 * @param props.showButtons whether to show the default form buttons (Next, Back, Submit)
 * @param props.showCard whether to show the form inside a card layout
 * @param props.showFirstEditableStep whether to automatically show the first editable step on form load
 * @param props.showLastStep whether to automatically show the last available step on form load
 * @param props.showMenu whether to force show the stepper menu, if undefined shows menu only when multiple steps exist
 * @param props.size the size of the form, can be 'auto', 'small', 'medium' or 'large', default is 'medium', 'auto' adapts to parent content
 * @param props.labels custom labels for form buttons and actions
 * @param props.stepperWidth custom stepper width if needed
 * @param props.onSubformMode internal method to show back button on subform or not
 * @returns the AutoForm component
 */
// oxlint-disable-next-line max-lines-per-function, max-statements
export function AutoForm({
  schemas,
  onSubmit,
  onCancel,
  initialData = {},
  logger,
  useSummaryStep,
  useSubmissionStep,
  showButtons = true,
  showCard,
  showFirstEditableStep,
  showLastStep,
  showMenu,
  size,
  labels,
  stepperWidth,
  onSubformMode,
}: AutoFormProps) {
  const [currentStep, setCurrentStep] = useState(getInitialStep(schemas, showFirstEditableStep, showLastStep));
  const [showSummary, setShowSummary] = useState(false);
  const [submissionProps, setSubmissionProps] = useState<AutoFormSubmissionStepProps | undefined>(undefined);
  const defaultValues = useMemo(() => getDefaultValues(schemas, initialData), [schemas, initialData]);
  const [formData, setFormData] = useState<AutoFormData>(defaultValues);
  const [showBackButtonInSubform, setShowBackButtonInSubform] = useState<boolean>(true);
  const currentSchema = schemas[currentStep];
  const lastAccessibleStepIndex = useMemo(() => getLastAccessibleStepIndex(schemas), [schemas]);
  const isLastStep = currentStep === lastAccessibleStepIndex;
  const finalLabels = { ...defaultLabels, ...labels };
  const [mode, setMode] = useState<"initial" | "subform">("initial");
  const [subformOptions, setSubformOptions] = useState<AutoFormSubformOptions | undefined>(undefined);
  const form = useForm({
    defaultValues,
    mode: "onBlur",
    resolver: (values, context, options) => zodResolver(filterSchema(currentSchema, values))(values, context, options),
  });

  function updateFormData() {
    const updatedData = { ...formData, ...form.getValues() };
    setFormData(updatedData);
    return updatedData;
  }
  /**
   * Handle submission for the current step of a multi-step form
   * @returns void
   */
  function handleStepSubmit() {
    const updatedData = updateFormData();
    if (currentSchema && hasCustomErrors(currentSchema, updatedData)) {
      logger?.warn("Step submission blocked by custom field errors");
      return;
    }
    logger?.info("Step form submitted", { updatedData });
    if (isLastStep && useSummaryStep) {
      setShowSummary(true);
    } else if (isLastStep) {
      void handleFinalSubmit();
    } else {
      setCurrentStep(prev => prev + 1);
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
    logger?.info("Final form submitted", { cleanedData });
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
    if (!isStepClickable(schemas, stepIndex, submissionProps?.status)) {
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

  const backToInitialMode = useCallback(async () => {
    setMode("initial");
    onSubformMode?.(true);
    await sleep(nbPercentMax);
    if (subformOptions?.querySelectorForScroll) {
      scrollToElement(subformOptions.querySelectorForScroll);
    }
  }, [subformOptions, onSubformMode]);

  /**
   * Shows a form
   * @param options the options for the subform
   * @param options.schema the Zod schema for the current step
   * @param options.initialData the initial data for the subform
   * @param options.onSubmit the function to call on form submission
   * @param options.querySelectorForScroll the query selector to the element to scroll after submit
   * @returns boolean indicating if the form should be shown
   */
  const showForm = useCallback(
    ({ schema, initialData, onSubmit, querySelectorForScroll }: AutoFormSubformOptions) => {
      globalThis.window.scrollTo({ top: 0 });
      onSubformMode?.(false);
      setMode("subform");
      setSubformOptions({
        initialData,
        onSubmit: data => {
          onSubmit(data);
          void backToInitialMode();
        },
        querySelectorForScroll,
        schema,
      });
    },
    [backToInitialMode, onSubformMode],
  );
  const steps = useMemo(
    () =>
      buildStepperSteps({
        currentStep,
        hasSubmission: Boolean(submissionProps),
        icons: defaultIcons,
        schemas,
        showSummary,
      }),
    [schemas, currentStep, showSummary, submissionProps],
  );
  const stepMetadata = getStepMetadata(currentSchema);
  const isStepperDisabled = submissionProps?.status === "success";
  const shouldShowStepper = (showMenu === undefined ? schemas.length > 1 : showMenu) && mode !== "subform";
  const cancelButton = onCancel ? { onClick: onCancel } : undefined;

  function renderSubmissionContent() {
    if (!submissionProps) {
      return;
    }
    const showBackButton = submissionProps.status === "error" || submissionProps.status === "unknown-error";
    const showHomeButton = submissionProps.status === "success" || submissionProps.status === "warning";
    return (
      <>
        <AutoFormSubmissionStep {...submissionProps} />
        {showBackButton && <AutoFormNavigation centerButton={cancelButton} leftButton={{ onClick: handleBack }} />}
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
        <AutoFormSummaryStep formData={formData} schemas={schemas} />
        {showButtons && (
          <AutoFormNavigation
            centerButton={cancelButton}
            leftButton={{ onClick: handleBack }}
            rightButton={{ label: finalLabels.summaryStepButton, name: "summary-proceed", onClick: handleFinalSubmit }}
          />
        )}
      </>
    );
  }

  function renderFormContent() {
    const rightButton = isLastStep
      ? { label: finalLabels.lastStepButton, name: "last-step-submit", type: "submit" as const }
      : { label: finalLabels.nextStep, name: "step-next", type: "submit" as const };
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleStepSubmit)}>
          <AutoFormFields logger={logger} schema={currentSchema} showForm={showForm} state={stepMetadata?.state} />
          {showButtons && (
            <AutoFormNavigation
              centerButton={cancelButton}
              leftButton={currentStep > 0 ? { onClick: handleBack } : undefined}
              rightButton={rightButton}
            />
          )}
        </form>
      </Form>
    );
  }

  function renderSubformContent() {
    if (!subformOptions) {
      return;
    }
    logger?.info("Rendering subform", { subformOptions });
    return (
      <>
        {showBackButtonInSubform && (
          <Button name="subform-back" onClick={backToInitialMode} variant="outline">
            <IconArrowLeft />
            Back
          </Button>
        )}
        <AutoForm
          initialData={subformOptions.initialData}
          onSubmit={subformOptions.onSubmit}
          schemas={[subformOptions.schema]}
          onSubformMode={value => setShowBackButtonInSubform(value)}
        />
      </>
    );
  }

  function renderContent() {
    if (submissionProps) {
      return renderSubmissionContent();
    }
    if (showSummary) {
      return renderSummaryContent();
    }
    if (mode === "subform") {
      return renderSubformContent();
    }
    return renderFormContent();
  }

  return (
    <div
      className={cn("mx-auto flex w-full", {
        "min-w-3xl": size === "medium",
        "min-w-5xl": size === "large",
        "min-w-xl": size === "small",
        "rounded-lg bg-white p-6 shadow-md": showCard,
      })}
    >
      {shouldShowStepper && (
        <AutoFormStepper
          disabled={isStepperDisabled}
          onStepClick={handleStepClick}
          steps={steps}
          width={stepperWidth}
        />
      )}
      <div className="flex-1 overflow-hidden">{renderContent()}</div>
    </div>
  );
}
