// oxlint-disable max-lines
import { getNested, Logger, nbPercentMax, Result, setNested, sleep, stringify } from "@monorepo/utils";
import type { ReactNode } from "react";
import { z } from "zod";
import { IconEdit } from "../icons/icon-edit";
import { IconSuccess } from "../icons/icon-success";
import { IconUpcoming } from "../icons/icon-upcoming";
import type { AutoFormData, AutoFormFieldMetadata, AutoFormFieldSectionMetadata, AutoFormProps, AutoFormStepMetadata, AutoFormSubmissionStepProps, AutoFormSummarySection, SelectOption } from "./auto-form.types";

/**
 * Gets the enum options from a Zod schema if it is a ZodEnum or an optional ZodEnum.
 * Returns an array of {label, value} objects. If custom options are provided in metadata, they are used.
 * Otherwise, enum values are converted to label/value pairs with capitalized labels.
 * @param fieldSchema the Zod schema to check
 * @returns the array of enum options as {label, value} objects
 */
export function getZodEnumOptions(fieldSchema: z.ZodType) {
  const metadata = getFieldMetadata(fieldSchema);
  if (metadata && "options" in metadata && metadata.options) {
    return Result.ok(metadata.options);
  }
  let rawOptions: string[] = [];
  if (fieldSchema.type === "enum") {
    rawOptions = (fieldSchema as z.ZodEnum).options as string[];
  } else if (fieldSchema.type === "optional" && (fieldSchema as z.ZodOptional<z.ZodEnum>).def.innerType.type === "enum") {
    rawOptions = (fieldSchema as z.ZodOptional<z.ZodEnum>).def.innerType.options as string[];
  } else {
    return Result.error("failed to get enum options from schema");
  }
  const options: SelectOption[] = rawOptions.map(option => ({
    label: option.charAt(0).toUpperCase() + option.slice(1),
    value: option,
  }));
  return Result.ok(options);
}

/**
 * Checks if the provided Zod schema is a ZodEnum or contains a ZodEnum as its inner type (e.g., optional enum).
 * @param fieldSchema the Zod schema to check
 * @returns true if the schema is (or contains) a ZodEnum; otherwise, false.
 */
export function isZodEnum(fieldSchema: z.ZodType) {
  if (fieldSchema.type === "enum") {
    return true;
  } else if (fieldSchema.type === "optional" && (fieldSchema as z.ZodOptional<z.ZodEnum>).def.innerType.type === "enum") {
    return true;
  }
  return false;
}

/**
 * Checks if a given Zod schema represents a boolean type, including boolean literals and optional booleans.
 * @param fieldSchema - The Zod schema to check.
 * @returns An object containing:
 *   - `isBoolean`: `true` if the schema is a boolean or boolean literal (including optional booleans), otherwise `false`.
 *   - `isBooleanLiteral`: `true` if the schema is a boolean literal (`true` or `false`), otherwise `false`.
 *   - `booleanLiteralValue`: The value of the boolean literal if applicable, otherwise `false`.
 */
export function checkZodBoolean(fieldSchema: z.ZodType) {
  let isBoolean = false;
  let isBooleanLiteral = false;
  let booleanLiteralValue = false;
  /* v8 ignore else -- @preserve */
  if (fieldSchema.type === "boolean") {
    isBoolean = true;
  } else if (fieldSchema.type === "literal") {
    isBooleanLiteral = (fieldSchema as z.ZodLiteral).value === true || (fieldSchema as z.ZodLiteral).value === false;
    isBoolean = isBooleanLiteral;
    booleanLiteralValue = Boolean((fieldSchema as z.ZodLiteral).value);
  } else if (fieldSchema.type === "optional" && (fieldSchema as z.ZodOptional<z.ZodBoolean>).def.innerType.type === "boolean") {
    isBoolean = true;
  }
  return { booleanLiteralValue, isBoolean, isBooleanLiteral };
}

/**
 * Checks if the provided Zod schema is a ZodBoolean or contains a ZodBoolean as its inner type (e.g., optional boolean).
 * @param fieldSchema the Zod schema to check
 * @returns true if the schema is (or contains) a ZodBoolean; otherwise, false.
 */
export function isZodBoolean(fieldSchema: z.ZodType) {
  if (fieldSchema.type === "boolean") {
    return true;
  } else if (fieldSchema.type === "literal") {
    const value = (fieldSchema as z.ZodLiteral).value;
    if (value === true || value === false) {
      return true;
    }
  } else if (fieldSchema.type === "optional" && (fieldSchema as z.ZodOptional<z.ZodBoolean>).def.innerType.type === "boolean") {
    return true;
  }
  return false;
}

/**
 * Checks if the provided Zod schema is a ZodNumber or contains a ZodNumber as its inner type (e.g., optional number).
 * @param fieldSchema the Zod schema to check
 * @returns true if the schema is (or contains) a ZodNumber; otherwise, false.
 */
export function isZodNumber(fieldSchema: z.ZodType) {
  if (fieldSchema.type === "number") {
    return true;
  } else if (fieldSchema.type === "optional" && (fieldSchema as z.ZodOptional<z.ZodNumber>).def.innerType.type === "number") {
    return true;
  }
  return false;
}

/**
 * Checks if the provided Zod schema is a ZodFile or contains a ZodFile as its inner type (e.g., optional file).
 * @param fieldSchema the Zod schema to check
 * @returns true if the schema is (or contains) a ZodFile; otherwise, false.
 */
export function isZodFile(fieldSchema: z.ZodType) {
  if (fieldSchema.type === "file") {
    return true;
  } else if (fieldSchema.type === "optional" && (fieldSchema as z.ZodOptional<z.ZodFile>).def.innerType.type === "file") {
    return true;
  }
  return false;
}

/**
 * Checks if the provided Zod schema is a ZodDate or contains a ZodDate as its inner type (e.g., optional date).
 * @param fieldSchema the Zod schema to check
 * @returns true if the schema is (or contains) a ZodDate; otherwise, false.
 */
export function isZodDate(fieldSchema: z.ZodType) {
  if (fieldSchema.type === "date") {
    return true;
  } else if (fieldSchema.type === "optional" && (fieldSchema as z.ZodOptional<z.ZodDate>).def.innerType.type === "date") {
    return true;
  }
  return false;
}

/**
 * Checks if the provided Zod schema is a ZodString or contains a ZodString as its inner type (e.g., optional string).
 * @param fieldSchema the Zod schema to check
 * @returns true if the schema is (or contains) a ZodString; otherwise, false.
 */
export function isZodString(fieldSchema: z.ZodType) {
  if (fieldSchema.type === "string") {
    return true;
  }
  if (fieldSchema.type === "optional" && (fieldSchema as z.ZodOptional<z.ZodString>).def.innerType.type === "string") {
    return true;
  }
  return false;
}

/**
 * Parses a dependsOn string to extract field name and optional expected value.
 * Supports formats like:
 * - 'fieldName' - checks if fieldName is truthy
 * - 'fieldName=value' - checks if fieldName equals value
 * @param dependsOn the dependsOn string to parse
 * @returns an object with fieldName and optional expectedValue
 */
export function parseDependsOn(dependsOn: string): { fieldName: string; expectedValue?: string } {
  const equalsIndex = dependsOn.indexOf("=");
  if (equalsIndex === -1) {
    return { fieldName: dependsOn };
  }
  return {
    expectedValue: dependsOn.slice(equalsIndex + 1),
    fieldName: dependsOn.slice(0, equalsIndex),
  };
}

/**
 * Determines whether a form field should be visible based on its schema metadata and the current form data.
 * @param fieldSchema the Zod schema for the field, which may contain metadata describing dependencies.
 * @param formData the current form data as a record of field names to values.
 * @returns `true` if the field should be visible; `false` otherwise.
 */
export function isFieldVisible(fieldSchema: z.ZodType, formData: AutoFormData) {
  const metadata = getFieldMetadata(fieldSchema);
  if (!metadata) {
    return true;
  }
  if ("isVisible" in metadata && metadata.isVisible) {
    return metadata.isVisible(formData);
  }
  if (!("dependsOn" in metadata) || !metadata.dependsOn) {
    return true;
  }
  const { fieldName, expectedValue } = parseDependsOn(metadata.dependsOn);
  const fieldValue = formData[fieldName];
  // If expectedValue is specified, check for equality
  if (expectedValue !== undefined) {
    return stringify(fieldValue) === expectedValue;
  }
  // Otherwise, check for truthiness
  return Boolean(fieldValue);
}

/**
 * Returns a filtered schema with only visible fields
 * @param schema the original Zod schema
 * @param formData the current form data to evaluate visibility
 * @returns a new Zod schema with only visible fields
 */
export function filterSchema(schema: z.ZodObject, formData: AutoFormData): z.ZodObject {
  const shape = schema.shape;
  const visibleShape: Record<string, z.ZodTypeAny> = {};
  for (const key of Object.keys(shape)) {
    const fieldSchema = shape[key] as z.ZodTypeAny;
    if (!isFieldVisible(fieldSchema, formData)) {
      continue;
    }
    const metadata = getFieldMetadata(fieldSchema);
    // Exclude section fields from validation schema
    if (metadata?.render === "section") {
      continue;
    }
    visibleShape[key] = fieldSchema;
  }
  return z.object(visibleShape);
}

/**
 * Gets the effective key mapping for a field by resolving key, keyIn, and keyOut metadata.
 * @param metadata - The field metadata object
 * @returns An object with keyIn and keyOut properties
 */
export function getKeyMapping(metadata?: AutoFormFieldMetadata): { keyIn: string | undefined; keyOut: string | undefined } {
  if (!metadata) {
    return { keyIn: undefined, keyOut: undefined };
  }
  const key = "key" in metadata && metadata.key ? metadata.key : undefined;
  const keyIn = "keyIn" in metadata && metadata.keyIn ? metadata.keyIn : key;
  const keyOut = "keyOut" in metadata && metadata.keyOut ? metadata.keyOut : key;
  return { keyIn, keyOut };
}

/**
 * Maps initial data using keyIn from schema metadata to match field names.
 * @param schema - The Zod schema object describing the form fields
 * @param externalData - The external data object with potentially different key names
 * @returns A new object with data mapped to schema field names using keyIn mappings
 */
export function mapExternalDataToFormFields(schema: z.ZodObject, externalData: AutoFormData) {
  const shape = schema.shape;
  const result: AutoFormData = {};
  for (const fieldName of Object.keys(shape)) {
    const fieldSchema = shape[fieldName] as z.ZodTypeAny;
    const metadata = getFieldMetadata(fieldSchema);
    const { keyIn } = getKeyMapping(metadata);
    // Use keyIn if provided, otherwise use field name
    const sourceKey = keyIn ?? fieldName;
    // Check if sourceKey contains a dot (nested path)
    if (sourceKey.includes(".")) {
      const value = getNested(externalData, sourceKey);
      if (value !== undefined) {
        result[fieldName] = value;
      }
    } else if (sourceKey in externalData) {
      result[fieldName] = externalData[sourceKey];
    }
  }
  return result;
}

/**
 * Cleans the submitted form data by filtering out fields that are not visible or are marked as excluded in the schema metadata.
 * Also applies keyOut mapping to convert field names back to external data format.
 * @param schema - The Zod schema object describing the form fields.
 * @param data - The submitted data object to be cleaned.
 * @returns A new object containing only the fields that are visible and not excluded according to the schema, with keyOut mappings applied.
 */
export function normalizeDataForSchema(schema: z.ZodObject, data: AutoFormData) {
  const shape = schema.shape;
  const result: AutoFormData = {};
  for (const [key, value] of Object.entries(data)) {
    const fieldSchema = shape[key] as z.ZodTypeAny;
    const metadata = getFieldMetadata(fieldSchema);
    if (!isFieldVisible(fieldSchema, data)) {
      continue;
    }
    if (metadata && "excluded" in metadata && metadata.excluded) {
      continue;
    }
    // Exclude section fields from output data
    if (metadata?.render === "section") {
      continue;
    }
    // Apply keyOut mapping if provided
    const { keyOut } = getKeyMapping(metadata);
    const outputKey = keyOut ?? key;
    // Check if outputKey contains a dot (nested path)
    if (outputKey.includes(".")) {
      setNested(result, outputKey, value);
    } else {
      result[outputKey] = value;
    }
  }
  return result;
}

/**
 * Cleans form data across all schemas by removing invisible/excluded fields from each schema.
 * @param schemas - Array of Zod schemas to clean data against
 * @param data - The form data to clean
 * @returns Cleaned data with invisible/excluded fields removed
 */
export function normalizeData(schemas: z.ZodObject[], data: AutoFormData) {
  let cleanedData = data;
  for (const schema of schemas) {
    cleanedData = normalizeDataForSchema(schema, cleanedData);
  }
  return cleanedData;
}

/**
 * Checks if a field should be included in the summary
 * @param fieldSchema - The field schema
 * @param metadata - The field metadata
 * @param data - The form data
 * @returns true if the field should be included in summary
 */
function shouldIncludeFieldInSummary(fieldSchema: z.ZodTypeAny, metadata: AutoFormFieldMetadata | undefined, data: AutoFormData) {
  if (metadata?.render === "section") {
    return false;
  }
  if (!isFieldVisible(fieldSchema, data)) {
    return false;
  }
  if (metadata?.excluded) {
    return false;
  }
  return true;
}

/**
 * Filters data for summary display by excluding fields from readonly and upcoming steps.
 * Only includes fields from editable steps.
 * @param schemas - Array of Zod schemas for all steps
 * @param data - The complete form data
 * @returns Filtered data containing only fields from editable steps
 */
export function filterDataForSummary(schemas: z.ZodObject[], data: AutoFormData) {
  const result: AutoFormData = {};
  for (const schema of schemas) {
    const stepMeta = getStepMetadata(schema);
    const stepState = stepMeta?.state;
    // Only include fields from editable steps (skip readonly and upcoming)
    if (stepState === "readonly" || stepState === "upcoming") {
      continue;
    }
    const shape = schema.shape;
    for (const [key, value] of Object.entries(data)) {
      const fieldSchema = shape[key] as z.ZodTypeAny;
      if (!fieldSchema) {
        continue;
      }
      const metadata = getFieldMetadata(fieldSchema);
      if (shouldIncludeFieldInSummary(fieldSchema, metadata, data)) {
        result[key] = value;
      }
    }
  }
  return result;
}

/**
 * Groups form data by sections for summary display
 * @param schemas - Array of Zod schemas for all steps
 * @param data - The complete form data
 * @returns Array of section groups, each containing a title and data
 */
export function sectionsFromEditableSteps(schemas: z.ZodObject[], data: AutoFormData) {
  const sections: Array<AutoFormSummarySection> = [];
  for (const schema of schemas) {
    const stepSections = sectionsFromEditableStep(schema, data);
    sections.push(...stepSections);
  }
  return sections;
}

// oxlint-disable-next-line max-statements
function sectionsFromEditableStep(schema: z.ZodObject, data: AutoFormData) {
  const stepMeta = getStepMetadata(schema);
  const stepState = stepMeta?.state;
  if (stepState === "readonly" || stepState === "upcoming") {
    return [];
  }
  const sections: Array<AutoFormSummarySection> = [];
  const shape = schema.shape;
  const fieldKeys = Object.keys(shape);
  let currentSectionTitle: AutoFormSummarySection["title"] = undefined;
  let currentSectionData: AutoFormSummarySection["data"] = {};
  function saveCurrentSection() {
    if (Object.keys(currentSectionData).length > 0) {
      sections.push({ data: currentSectionData, title: currentSectionTitle });
    }
  }
  for (const key of fieldKeys) {
    const fieldSchema = shape[key] as z.ZodTypeAny;
    if (!fieldSchema) {
      continue;
    }
    const metadata = getFieldMetadata(fieldSchema);
    // Check if this field is a section marker
    if (metadata?.render === "section") {
      saveCurrentSection();
      // Start new section
      currentSectionTitle = "title" in metadata ? metadata.title : undefined;
      currentSectionData = {};
      continue;
    }
    // Add field to current section if it should be included
    const value = data[key];
    if (shouldIncludeFieldInSummary(fieldSchema, metadata, data)) {
      currentSectionData[key] = {
        label: metadata?.label ?? key,
        value,
      };
    }
  }
  saveCurrentSection();
  return sections;
}

/**
 * Mocks the submission of an auto-form to an external API
 * @param status the status to simulate
 * @param message the message to shows on submission step
 * @returns the simulated submission result
 */
export async function mockSubmit(status: AutoFormSubmissionStepProps["status"], message: ReactNode): Promise<{ submission: AutoFormSubmissionStepProps }> {
  const logger = new Logger();
  await sleep(nbPercentMax); // simulate api/network delay
  const submission: AutoFormSubmissionStepProps = {
    children: message,
    detailsList: [] as string[],
    status,
  };
  if (status === "warning") {
    submission.detailsList = ["Some fields have warnings.", "Submission is complete anyway."];
    logger.showInfo("Form submitted with warnings.");
  } else if (status === "success") {
    submission.detailsList = ["All data is valid.", "No errors found."];
    logger.showSuccess("Form submitted successfully!");
  } else {
    submission.detailsList = ["Network error occurred.", "Please retry submission."];
    logger.showError("Form submission failed.");
  }
  return { submission };
}

export const defaultLabels = {
  homeButton: "Return to Homepage",
  lastStepButton: "Submit",
  nextStep: "Next",
  previousStep: "Back",
  summaryStepButton: "Proceed",
} satisfies AutoFormProps["labels"];

export const defaultIcons = {
  editable: <IconEdit className="text-muted-foreground size-6" />,
  readonly: <IconSuccess className="text-success size-6" />,
  upcoming: <IconUpcoming className="text-muted-foreground size-6" />,
} satisfies Record<NonNullable<AutoFormStepMetadata["state"]>, ReactNode>;

/**
 * Gets metadata from a Zod field schema if it exists.
 * @param fieldSchema - The Zod schema to extract metadata from
 * @returns The metadata object or undefined if not present
 */
export function getFieldMetadata(fieldSchema?: z.ZodType): AutoFormFieldMetadata | undefined {
  if (!fieldSchema || typeof fieldSchema.meta !== "function") {
    return undefined;
  }
  return fieldSchema.meta() as AutoFormFieldMetadata;
}

/**
 * Gets metadata from a Zod field schema, throw if not exists, throw if section metadata
 * @param fieldName - The name of the form field
 * @param fieldSchema - The Zod schema to extract metadata from
 * @returns The metadata object or undefined if not present
 */
export function getFieldMetadataOrThrow(fieldName: string, fieldSchema?: z.ZodType) {
  const metadata = getFieldMetadata(fieldSchema);
  if (!metadata) {
    throw new Error(`Field "${fieldName}" is missing metadata`);
  }
  if (metadata.render === "section") {
    throw new Error(`Cannot render field "${fieldName}" with section metadata`);
  }
  return metadata;
}

/**
 * Helper to write AutoForm fields
 * @param fieldSchema zod schema
 * @param fieldMetadata related metadata
 * @returns field schema with valid metadata
 * @example field(z.string(), { label: "First-name" })
 */
export function field(fieldSchema: z.ZodType, fieldMetadata: AutoFormFieldMetadata) {
  return fieldSchema.meta(fieldMetadata);
}

/**
 * Helper to write AutoForm section
 * @param sectionMetadata related metadata
 * @returns section schema with valid metadata
 * @example section({ title: "General case data", line: true })
 */
export function section(sectionMetadata: Omit<AutoFormFieldSectionMetadata, "render">) {
  const metadata = { ...sectionMetadata, render: "section" } satisfies AutoFormFieldSectionMetadata;
  return z.string().optional().meta(metadata);
}

/**
 * Gets step metadata from a Zod object schema if it exists.
 * @param stepSchema - The Zod object schema to extract metadata from
 * @returns The step metadata object or undefined if not present
 */
export function getStepMetadata(stepSchema: z.ZodObject): AutoFormStepMetadata | undefined {
  if (typeof stepSchema.meta !== "function") {
    return undefined;
  }
  return stepSchema.meta() as AutoFormStepMetadata;
}

/**
 * Helper to write AutoForm steps
 * @param stepSchema zod schema
 * @param stepMetadata related metadata
 * @returns step schema with valid metadata
 * @example step(z.object({ firstName: field(...) }), { title: "User infos" })
 */
export function step(stepSchema: z.ZodObject, stepMetadata?: AutoFormStepMetadata) {
  if (!stepMetadata) {
    return stepSchema;
  }
  return stepSchema.meta(stepMetadata);
}

/**
 * Determines which form field component should render the given field schema.
 * Checks the explicit render property first, then falls back to schema type detection.
 * @param fieldSchema the Zod schema for the field
 * @returns the component name to render like 'text', 'number', 'date', etc... Undefined if no suitable component found.
 */
export function getFormFieldRender(fieldSchema: z.ZodType): AutoFormFieldMetadata["render"] {
  const { render } = getFieldMetadata(fieldSchema) || {};
  if (render) {
    return render;
  }
  if (isZodFile(fieldSchema)) {
    return "upload";
  }
  if (isZodDate(fieldSchema)) {
    return "date";
  }
  if (isZodEnum(fieldSchema)) {
    return "select";
  }
  if (isZodNumber(fieldSchema)) {
    return "number";
  }
  if (isZodBoolean(fieldSchema)) {
    return "boolean";
  }
  if (isZodString(fieldSchema)) {
    return "text";
  }
  return undefined;
}
