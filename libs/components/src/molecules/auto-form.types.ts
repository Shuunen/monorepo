/** biome-ignore-all lint/suspicious/noExplicitAny: it's ok here */
import type { Logger, Simplify } from "@monorepo/utils";
import type { JSX, ReactNode } from "react";
import type { z } from "zod";
import type { AutoFormStepperStep } from "./auto-form-stepper";
import type { FormFieldSectionProps } from "./form-field-section";
import type { FormSummaryData } from "./form-summary";

/** The data output from auto form, sadly not typed :'( */
export type AutoFormData = Record<string, unknown>;

export type TypeLike<Type> = Type | ((data?: AutoFormData) => Type);

export type NumberLike = TypeLike<number>;

export type StringLike = TypeLike<string>;

/** Props for the AutoForm component, which generates a form based on provided Zod schemas. */
export type AutoFormProps = {
  /** Logger instance for logging form events, for debugging purposes. */
  logger?: Logger;
  /** An array of Zod object schemas representing each step of the form. */
  schemas: z.ZodObject[];
  /** Optional callback function invoked when the cancel button is clicked. */
  onCancel?: () => void;
  /** Initial data to pre-fill the form fields. */
  initialData?: AutoFormData;
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
  /** Whether to automatically show the first editable step on form load, default is false */
  showFirstEditableStep?: boolean;
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
  /** Callback function invoked when the form is go to subform. Only to use internally */
  onSubformMode?: (showBackButton: boolean) => void;
};

export type AutoFormStepState = "readonly" | "editable" | "upcoming";

/**
 * Metadata describing the configuration and behavior of a step in an auto-generated multi-step form.
 * Applied to the schema object itself using `.meta()`.
 * example: `step(z.object({ ... }), { title: 'Personal Information', subtitle: 'Basic details', suffix: '1/3' })`
 */
export type AutoFormStepMetadata = Simplify<
  Pick<AutoFormStepperStep, "title" | "section" | "subtitle" | "suffix" | "indent"> & {
    /** The interaction state of the step */
    state?: AutoFormStepState;
  }
>;

export type AutoFormFieldsMetadata = Simplify<
  AutoFormFieldBaseMetadata & {
    /** Minimum number of items allowed in the form list */
    minItems?: number;
    /** Maximum number of items allowed in the form list */
    maxItems?: number;
    /** Number of fields by default, can be dynamic, ex : field A has 3 entries and we want this field to be initialized accordingly with 3 fields too */
    nbItems?: NumberLike;
    render: "field-list";
  }
>;

export type AutoFormFormsMetadata = Simplify<
  AutoFormFieldBaseMetadata & {
    /** Icon to display alongside the form list title */
    icon?: JSX.Element | ((params: Record<string, unknown>) => JSX.Element);
    /** Function to generate the label for each item in the list, based on its data, for example data => `${data.name} (${data.age} years)` */
    identifier?: (data?: AutoFormData) => string;
    /** Custom labels for the form list */
    labels?: {
      /** Label for the button to add a new form to the list, default is "Add" */
      addButton?: string;
      /** Label for the button to complete a form in the list, default is "Complete" */
      completeButton?: string;
    };
    /** Minimum number of items allowed in the form list */
    minItems?: number;
    /** Maximum number of items allowed in the form list */
    maxItems?: number;
    /** Number of fields by default, can be dynamic, ex : field A has 3 entries and we want this field to be initialized accordingly with 3 fields too */
    nbItems?: NumberLike;
    render: "form-list";
  }
>;

export type AutoFormAcceptFieldMetadata = Simplify<
  AutoFormFieldBaseMetadata & {
    labels?: {
      /** Label for the accept button, default is "Accept" */
      accept?: string;
      /** Label for the reject button, default is "Reject" */
      reject?: string;
    };
    render: "accept";
  }
>;

/**
 * Metadata describing the configuration and behavior of a section field in an auto-generated form.
 * example: `section({ title: 'Main infos', line: true })`
 */
export type AutoFormFieldSectionMetadata = { render: "section" } & FormFieldSectionProps &
  AutoFormFieldConditionalMetadata;

/** A single condition or an OR group of conditions (inner array = OR) */
export type DependsOnCondition = string | string[];

/**
 * Metadata describing the configuration of a conditional rendering in auto-generated form fields.
 * example: `field(z.string(), { dependsOn: "field1=xxx" })` - single condition
 * example: `field(z.string(), { dependsOn: ["field1", "field2"] })` - AND (all must be true)
 * example: `field(z.string(), { dependsOn: [["field1", "field2"]] })` - OR (at least one must be true)
 * example: `field(z.string(), { dependsOn: [["field1", "field2"], "field3"] })` - (field1 OR field2) AND field3
 */

/** We should test what API we keep because dependsOn and isVisible covers the same use cases and add complexity to the codebase */
export type AutoFormFieldConditionalMetadata = {
  /** The name of another field that this field depends on. Supports field=value and field!=value syntax for specific value checks. Use nested arrays for OR logic: [['a', 'b']] means a OR b. */
  dependsOn?: string | DependsOnCondition[];
  /** More generic way to express condition on whether or not a field is visible. When provided, this function has precedence over `dependsOn`. */
  isVisible?: (formData: AutoFormData) => boolean;
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
  /** Zod codec to transform input and output data. */
  codec?: z.ZodCodec;
  /** Custom options for select/enum fields with label/value pairs. */
  options?: SelectOption[];
  /** Custom error validation function that receives the current form data and returns an error message string or undefined. Useful for cross-field validation. */
  errors?: (data: AutoFormData) => string | undefined;
  /** Force the field to be rendered with a specific component, else use automatic field-schema detection */
  render?:
    | "text"
    | "textarea"
    | "number"
    | "date"
    | "select"
    | "boolean"
    | "upload"
    | "accept"
    | "password"
    | "radio"
    | "field-list"
    | "form-list";
} & AutoFormFieldConditionalMetadata;

/**
 * Metadata describing the configuration and behavior of a field in an auto-generated form.
 * example: `field(z.string(), { label: 'First Name', placeholder: 'Enter your first name', state: 'editable' })`
 * example: `section({ title: 'First Name'})`
 */
export type AutoFormFieldMetadata =
  | AutoFormFieldBaseMetadata
  | AutoFormFieldSectionMetadata
  | AutoFormFieldsMetadata
  | AutoFormFormsMetadata
  | AutoFormAcceptFieldMetadata;

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

/** A section of data in the auto form summary */
export type AutoFormSummarySection = {
  /** The data entries in the section, with label and value */
  data: FormSummaryData;
  /** Optional title for the section, developers are not forced to provide one */
  title?: string;
};

/** Options for displaying a subform in the auto form */
export type AutoFormSubformOptions = {
  /** The step/zod schema for the subform */
  schema: z.ZodObject;
  /** Initial data to pre-fill the subform fields. */
  initialData: AutoFormData;
  /** The query selector to the element to scroll after submit */
  querySelectorForScroll: string;
  /** Callback function invoked when the subform is submitted, returning the submission data. */
  onSubmit: (data: AutoFormData) => void;
};
