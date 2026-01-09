/** biome-ignore-all lint/suspicious/noExplicitAny: it's ok here */
import type { Logger, Simplify } from "@monorepo/utils";
import type { ReactNode } from "react";
import type { z } from "zod";
import type { AutoFormStepperStep } from "./auto-form-stepper";
import type { FormFieldSectionProps } from "./form-field-section";
import type { FormSummaryData } from "./form-summary";

/** Props for the AutoForm component, which generates a form based on provided Zod schemas. */
export type AutoFormProps = {
  /** Logger instance for logging form events, for debugging purposes. */
  logger?: Logger;
  /** An array of Zod object schemas representing each step of the form. */
  schemas: z.ZodObject[];
  /** Optional callback function invoked whenever the form data changes, providing the cleaned data. */
  onChange?: (data: Record<string, unknown>) => void;
  /** Optional callback function invoked when the cancel button is clicked. */
  onCancel?: () => void;
  /** Initial data to pre-fill the form fields. */
  initialData?: Record<string, unknown>;
  /** Whether to include a summary step before submission */
  useSummaryStep?: boolean;
  /** Whether to include a submission step after form submission */
  useSubmissionStep?: boolean;
  // oxlint-disable no-explicit-any
  /** Callback function invoked when the form is submitted, returning the submission step props. */
  onSubmit?: (data: any) => any;
  /** Whether to show the default form buttons (Next, Back, Submit), default is true */
  showButtons?: boolean;
  // oxlint-enable no-explicit-any
  /** Whether to show the form inside a card layout, default is false */
  showCard?: boolean;
  /** Whether to automatically show the last available step on form load, default is false */
  showLastStep?: boolean;
  /** Whether to force show the stepper menu. If undefined, shows menu only when multiple steps exist. If true, always shows menu. If false, never shows menu. */
  showMenu?: boolean;
  /** The size of the form, can be 'auto', 'small', 'medium' or 'large', default is 'medium', 'auto' adapts to parent content */
  size?: "auto" | "small" | "medium" | "large";
  /** Custom labels for form buttons and actions */
  labels?: {
    /** Label for the back to home button on submission step, default is "Return to Homepage" */
    homeButton?: string;
    /** Label for the button on final step to submit the form, default is "Submit" */
    lastStepButton?: string;
    /** Label for the button to go to the next step, default is "Next" */
    nextStep?: string;
    /** Label for the button to go to the previous step, default is "Back" */
    previousStep?: string;
    /** Label for the button on the summary step to proceed, default is "Proceed" */
    summaryStepButton?: string;
  };
  /** A fixed width for the stepper if needed */
  stepperWidth?: number;
};

/**
 * Metadata describing the configuration and behavior of a step in an auto-generated multi-step form.
 * Applied to the schema object itself using `.meta()`.
 * example: `step(z.object({ ... }), { title: 'Personal Information', subtitle: 'Basic details', suffix: '1/3' })`
 */
export type AutoFormStepMetadata = Simplify<
  Pick<AutoFormStepperStep, "title" | "section" | "subtitle" | "suffix" | "indent"> & {
    /** The interaction state of the step */
    state?: "readonly" | "editable" | "upcoming";
  }
>;

export type AutoFormFieldFormsMetadata = Simplify<
  AutoFormFieldBaseMetadata & {
    identifier?: (data: Record<string, unknown>) => string;
    maxItems?: number;
    render: "form-list";
  }
>;

/**
 * Metadata describing the configuration and behavior of a section field in an auto-generated form.
 * example: `section({ title: 'Main infos', line: true })`
 */
export type AutoFormFieldSectionMetadata = { render: "section" } & FormFieldSectionProps & AutoFormFieldConditionalMetadata;

/**
 * Metadata describing the configuration of a conditional rendering in auto-generated form fields.
 * example: `field(z.string(), { dependsOn: "field1=xxx" })`
 * example: `field(z.string(), { isVisible: (formData) => isLegalBaseWip(formData)" })`
 */
export type AutoFormFieldConditionalMetadata = {
  /** The name of another field that this field depends on. Supports field=value syntax for specific value checks. */
  dependsOn?: string;
  /** More generic way to express condition on whether or not a field is visible. When provided, this function has precedence over `dependsOn` */
  // oxlint-disable-next-line no-explicit-any
  isVisible?: (formData: Record<string, any>) => boolean;
};

/**
 * Metadata describing the configuration and behavior of a field in an auto-generated form.
 * example: `field(z.string(), { label: 'First Name', placeholder: 'Enter your first name', state: 'editable' })`
 */
export type AutoFormFieldBaseMetadata = {
  /** The display label for the form field. */
  label?: string;
  /** Placeholder text shown in the input when empty. */
  placeholder?: string;
  /** The interaction state of the field. */
  state?: "editable" | "readonly" | "disabled";
  /** Whether the field should be excluded from the form. */
  excluded?: boolean;
  /** Key mapping for both input and output data. Equivalent to setting both keyIn and keyOut. */
  key?: string;
  /** Key to map initial data input. Used when loading data from external sources. */
  keyIn?: string;
  /** Key to map submitted data output. Used when submitting data to external sources. */
  keyOut?: string;
  /** Custom options for select/enum fields with label/value pairs. */
  options?: SelectOption[];
  /** Force the field to be rendered with a specific component, else use automatic field-schema detection */
  render?: "text" | "textarea" | "number" | "date" | "select" | "boolean" | "upload" | "accept" | "password" | "form-list";
} & AutoFormFieldConditionalMetadata;

/**
 * Metadata describing the configuration and behavior of a field in an auto-generated form.
 * example: `field(z.string(), { label: 'First Name', placeholder: 'Enter your first name', state: 'editable' })`
 * example: `section({ title: 'First Name'})`
 */
export type AutoFormFieldMetadata = AutoFormFieldBaseMetadata | AutoFormFieldSectionMetadata | AutoFormFieldFormsMetadata;

/** Option for select/enum fields in the auto-generated form. */
export type SelectOption = {
  /** The display label for the option, like "United States" */
  label: string;
  /** The actual value for the option, like "US" */
  value: string;
};

/** Props for the AutoFormSubmissionStep component, which displays the submission status of the form. */
export type AutoFormSubmissionStepProps = {
  /** The message or content to display in the step, could be a paragraph for example. */
  children: ReactNode;
  /** A list of details to add to the status message */
  detailsList?: string[];
  /** The actual status of the submission */
  status: "loading" | "success" | "warning" | "error" | "unknown-error";
  /** A list of details to add to a tooltip to give some context to the user */
  tooltipDetailsList?: string[];
};

/** The data output from auto form, sadly not typed :'( */
export type AutoFormData = Record<string, unknown>;

/** A section of data in the auto form summary */
export type AutoFormSummarySection = {
  /** The data entries in the section, with label and value */
  data: FormSummaryData;
  /** Optional title for the section, developers are not forced to provide one */
  title?: string;
};

export type AutoFormSubformOptions = { schema: z.ZodObject; initialData: Record<string, unknown>; onSubmit: (data: Record<string, unknown>) => void }
