// oxlint-disable max-lines
import {
  getNested,
  isString,
  Logger,
  nbPercentMax,
  nbThird,
  Result,
  setNested,
  sleep,
  stringify,
} from "@monorepo/utils";
import { isEmptyObject, isFunction } from "es-toolkit";
import type { ReactNode } from "react";
import { z } from "zod";
import type {
  AutoFormAcceptFieldMetadata,
  AutoFormData,
  AutoFormFieldMetadata,
  AutoFormFieldSectionMetadata,
  AutoFormFieldsMetadata,
  AutoFormFormsMetadata,
  AutoFormStepMetadata,
  AutoFormSubmissionStepProps,
  AutoFormSummarySection,
  DependsOnCondition,
  SelectOption,
  TypeLike,
} from "./auto-form.types";

const logger = new Logger();

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
  } else if (
    fieldSchema.type === "optional" &&
    (fieldSchema as z.ZodOptional<z.ZodEnum>).def.innerType.type === "enum"
  ) {
    const childSchema = (fieldSchema as z.ZodOptional<z.ZodEnum>).unwrap();
    const childMetadata = childSchema.meta();
    if (childMetadata?.options) {
      return Result.ok(childMetadata.options as SelectOption[]);
    }
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
 * Checks if the provided Zod schema is a specific Zod type
 * @param fieldSchema the Zod schema to check
 * @param type the Zod type to check
 * @returns true if the schema is (or contains) this zod type
 */
function isZodType(fieldSchema: z.ZodType, type: z.ZodType["type"]) {
  const isType = fieldSchema.type === type;
  const isTypeLiteral =
    fieldSchema.type === "optional" && (fieldSchema as z.ZodOptional<z.ZodType>).def.innerType.type === type;
  const isTypeUnwrapped = getUnwrappedSchema(fieldSchema).type === type;
  return isType || isTypeLiteral || isTypeUnwrapped;
}

/**
 * Checks if the provided Zod schema is a ZodEnum or contains a ZodEnum as its inner type (e.g., optional enum).
 * @param fieldSchema the Zod schema to check
 * @returns true if the schema is (or contains) a ZodEnum; otherwise, false.
 */
export function isZodEnum(fieldSchema: z.ZodType): fieldSchema is z.ZodEnum {
  return isZodType(fieldSchema, "enum");
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
  /* c8 ignore else */
  if (fieldSchema.type === "boolean") {
    isBoolean = true;
  } else if (fieldSchema.type === "literal") {
    isBooleanLiteral = (fieldSchema as z.ZodLiteral).value === true || (fieldSchema as z.ZodLiteral).value === false;
    isBoolean = isBooleanLiteral;
    booleanLiteralValue = Boolean((fieldSchema as z.ZodLiteral).value);
  } else if (
    fieldSchema.type === "optional" &&
    (fieldSchema as z.ZodOptional<z.ZodBoolean>).def.innerType.type === "boolean"
  ) {
    isBoolean = true;
  }
  return { booleanLiteralValue, isBoolean, isBooleanLiteral };
}

/**
 * Checks if the provided Zod schema is a ZodBoolean or contains a ZodBoolean as its inner type (e.g., optional boolean).
 * @param fieldSchema the Zod schema to check
 * @returns true if the schema is (or contains) a ZodBoolean; otherwise, false.
 */
export function isZodBoolean(fieldSchema: z.ZodType): fieldSchema is z.ZodBoolean {
  return checkZodBoolean(fieldSchema).isBoolean;
}

/**
 * Checks if the provided Zod schema is a ZodNumber or contains a ZodNumber as its inner type (e.g., optional number).
 * @param fieldSchema the Zod schema to check
 * @returns true if the schema is (or contains) a ZodNumber; otherwise, false.
 */
export function isZodNumber(fieldSchema: z.ZodType): fieldSchema is z.ZodNumber {
  return isZodType(fieldSchema, "number");
}

/**
 * Checks if the provided Zod schema is a ZodFile or contains a ZodFile as its inner type (e.g., optional file).
 * @param fieldSchema the Zod schema to check
 * @returns true if the schema is (or contains) a ZodFile; otherwise, false.
 */
export function isZodFile(fieldSchema: z.ZodType): fieldSchema is z.ZodFile {
  return isZodType(fieldSchema, "file");
}

/**
 * Checks if the provided Zod schema is a ZodDate or contains a ZodDate as its inner type (e.g., optional date).
 * @param fieldSchema the Zod schema to check
 * @returns true if the schema is (or contains) a ZodDate; otherwise, false.
 */
export function isZodDate(fieldSchema: z.ZodType): fieldSchema is z.ZodDate {
  const isDate = isZodType(fieldSchema, "date");
  const isDateString = fieldSchema.type === "string" && (fieldSchema as z.ZodString).format === "date";
  return isDate || isDateString;
}

/**
 * Checks if the provided Zod schema is a ZodArray or contains a ZodArray as its inner type (e.g., optional array).
 * @param fieldSchema the Zod schema to check
 * @returns true if the schema is (or contains) a ZodArray; otherwise, false.
 */
export function isZodArray(fieldSchema: z.ZodType): fieldSchema is z.ZodArray {
  return isZodType(fieldSchema, "array");
}

/**
 * Checks if the provided Zod schema is a ZodObject or contains a ZodObject as its inner type (e.g., optional object).
 * @param fieldSchema the Zod schema to check
 * @returns true if the schema is (or contains) a ZodObject; otherwise, false.
 */
export function isZodObject(fieldSchema: z.ZodType): fieldSchema is z.ZodObject {
  return isZodType(fieldSchema, "object");
}

/**
 * Checks if the provided Zod schema is a ZodString or contains a ZodString as its inner type (e.g., optional string).
 * @param fieldSchema the Zod schema to check
 * @returns true if the schema is (or contains) a ZodString; otherwise, false.
 */
export function isZodString(fieldSchema: z.ZodType): fieldSchema is z.ZodString {
  return isZodType(fieldSchema, "string");
}

export type DependsOnOperator = "=" | "!=";

export type ParsedDependsOn = {
  fieldName: string;
  expectedValue?: string;
  operator?: DependsOnOperator;
};

/**
 * Parses a dependsOn string to extract field name and optional expected value.
 * Supports formats like:
 * - 'fieldName' - checks if fieldName is truthy
 * - 'fieldName!=value' - checks if fieldName is different from value
 * @param dependsOn the dependsOn string to parse
 * @returns an object with fieldName, optional expectedValue, and optional operator
 */
export function parseDependsOnSingleValue(dependsOn: string): ParsedDependsOn {
  const notEqualsIndex = dependsOn.indexOf("!=");
  if (notEqualsIndex !== -1) {
    return {
      expectedValue: dependsOn.slice(notEqualsIndex + nbThird),
      fieldName: dependsOn.slice(0, notEqualsIndex),
      operator: "!=",
    };
  }
  const equalsIndex = dependsOn.indexOf("=");
  if (equalsIndex === -1) {
    return { fieldName: dependsOn };
  }
  return {
    expectedValue: dependsOn.slice(equalsIndex + 1),
    fieldName: dependsOn.slice(0, equalsIndex),
    operator: "=",
  };
}

/**
 * Parses a dependsOn value to extract field names and optional expected values.
 * Supports formats like:
 * - 'fieldName' - checks if fieldName is truthy
 * - 'fieldName=value' - checks if fieldName equals value
 * - 'fieldName!=value' - checks if fieldName is different from value
 * - ['fieldName', 'fieldName2'] - checks if fieldName AND fieldName2 are truthy
 * - [['fieldName', 'fieldName2']] - checks if fieldName OR fieldName2 is truthy
 * - [['fieldName', 'fieldName2'], 'fieldName3'] - checks if (fieldName OR fieldName2) AND fieldName3
 * @param dependsOn the dependsOn string or array of conditions to parse
 * @returns an array of OR groups (outer = AND, inner = OR)
 */
export function parseDependsOn(dependsOn: string | DependsOnCondition[]): ParsedDependsOn[][] {
  // Single string: wrap in double array (AND of single OR group with single condition)
  if (isString(dependsOn)) {
    return [[parseDependsOnSingleValue(dependsOn)]];
  }
  // Array of conditions
  return dependsOn.map(conditions => {
    // If condition is a string, it's a single condition (wrap in array for OR group)
    if (isString(conditions)) {
      return [parseDependsOnSingleValue(conditions)];
    }
    // If condition is an array, it's an OR group
    // oxlint-disable-next-line max-nested-callbacks
    return conditions.map(condition => parseDependsOnSingleValue(condition));
  });
}

/**
 * Evaluates a single parsed condition against form data.
 * @param parsedDependsOn the parsed dependsOn condition to evaluate
 * @param parsedDependsOn.fieldName the field name to evaluate
 * @param parsedDependsOn.expectedValue the expected value to evaluate
 * @param parsedDependsOn.operator the operator to evaluate
 * @param formData the current form data
 * @returns true if the condition is satisfied
 */
function evaluateCondition({ fieldName, expectedValue, operator }: ParsedDependsOn, formData: AutoFormData): boolean {
  const fieldValue = formData[fieldName];
  // If expectedValue is specified, check based on operator
  if (expectedValue !== undefined) {
    const isEqual = stringify(fieldValue) === expectedValue;
    return operator === "!=" ? !isEqual : isEqual;
  }
  // Otherwise, check for truthiness
  return Boolean(fieldValue);
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
  // Outer array = AND (every group must pass), Inner array = OR (at least one condition in group must pass)
  return parseDependsOn(metadata.dependsOn).every(orGroup =>
    // oxlint-disable-next-line max-nested-callbacks
    orGroup.some(condition => evaluateCondition(condition, formData)),
  );
}

/**
 * Returns a filtered schema with only visible fields
 * @param schema the original Zod schema
 * @param formData the current form data to evaluate visibility
 * @returns a new Zod schema with only visible fields
 */
export function filterSchema(schema: z.ZodObject, formData: AutoFormData = {}): z.ZodObject {
  const shape = schema.shape;
  const visibleShape: Record<string, z.ZodType> = {};
  for (const key of Object.keys(shape)) {
    const fieldSchema = shape[key] as z.ZodType;
    if (!isFieldVisible(fieldSchema, formData)) {
      continue;
    }
    const metadata = getFieldMetadata(fieldSchema);
    if (metadata?.render === "section") {
      continue;
    }
    if (isZodArray(fieldSchema)) {
      const result = getElementSchema(fieldSchema);
      if (result.ok && isZodObject(result.value)) {
        logger.debug(`filterSchema "${key}" creating a new forms with recursive call`);
        visibleShape[key] = forms(filterSchema(result.value, formData), fieldSchema.meta() as AutoFormFormsMetadata);
        continue;
      }
    }
    logger.debug(`filterSchema "${key}" of type "${fieldSchema.type}" isVisible`);
    visibleShape[key] = fieldSchema;
  }
  return z.object(visibleShape);
}

/**
 * Gets the effective key mapping for a field by resolving key, keyIn, and keyOut metadata.
 * @param metadata - The field metadata object
 * @returns An object with keyIn and keyOut properties
 */
export function getKeyMapping(metadata?: AutoFormFieldMetadata): {
  keyIn: string | undefined;
  keyOut: string | undefined;
} {
  if (!metadata) {
    return { keyIn: undefined, keyOut: undefined };
  }
  const key = "key" in metadata && metadata.key ? metadata.key : undefined;
  const keyIn = "keyIn" in metadata && metadata.keyIn ? metadata.keyIn : key;
  const keyOut = "keyOut" in metadata && metadata.keyOut ? metadata.keyOut : key;
  return { keyIn, keyOut };
}

function getDataForField({
  fieldSchema,
  externalData,
  sourceKey,
}: {
  fieldSchema: z.ZodType;
  externalData: AutoFormData;
  sourceKey: string;
}) {
  const isSourceKeyNested = sourceKey.includes(".");
  const hasData = sourceKey in externalData || isSourceKeyNested;

  if (!hasData) {
    return;
  }

  const value = isSourceKeyNested ? getNested(externalData, sourceKey) : externalData[sourceKey];
  return getValueFromCodec({ fieldSchema, method: "decode", value });
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
    const fieldSchema = shape[fieldName] as z.ZodType;
    const metadata = getFieldMetadata(fieldSchema);
    const { keyIn } = getKeyMapping(metadata);
    // Use keyIn if provided, otherwise use field name
    const sourceKey = keyIn ?? fieldName;
    const data = getDataForField({ externalData, fieldSchema, sourceKey });
    if (data !== undefined) {
      result[fieldName] = data;
    }
  }
  return result;
}

function shouldIncludeField(fieldSchema: z.ZodType, metadata: AutoFormFieldMetadata | undefined, data: AutoFormData) {
  if (metadata?.render === "section") {
    return false;
  }
  if (metadata && "excluded" in metadata && metadata.excluded) {
    return false;
  }
  if (!isFieldVisible(fieldSchema, data)) {
    return false;
  }
  return true;
}

export function getUnwrappedSchema(schema: z.ZodType) {
  if ("unwrap" in schema && ["default", "optional", "prefault"].includes(schema.type)) {
    return getUnwrappedSchema((schema as z.ZodOptional<z.ZodType>).unwrap());
  }
  return schema;
}

export function getElementSchema(fieldSchema: z.ZodType) {
  const schema = getUnwrappedSchema(fieldSchema);
  if (!isZodArray(schema)) {
    logger?.error("cant get element of a non-array schema");
    return Result.error("cant get element of a non-array schema");
  }
  // we need to type as ZodType because as of today 2026-01-27 zod is typing an element as a weird internal z.core.$ZodType
  return Result.ok(schema.element as z.ZodType);
}

type GetValueWithCodecProps = {
  fieldSchema: z.ZodType | undefined;
  value: unknown;
  method: "encode" | "decode";
  parentSchema?: z.ZodType;
};

function getValueWithCodec({ fieldSchema, value, method, parentSchema }: GetValueWithCodecProps) {
  const metadata = getFieldMetadata(fieldSchema) || getFieldMetadata(parentSchema);
  const codec = metadata && "codec" in metadata && metadata.codec;
  if (codec) {
    const result = Result.trySafe(() => codec[method](value));
    if (!result.ok) {
      logger.error("Failed to apply codec", { metadata, method, value });
      return undefined;
    }
    return result.value;
  }
  return value;
}

function getValueFromCodec({ fieldSchema, value, method, parentSchema }: GetValueWithCodecProps): unknown {
  if (value === null || value === undefined || !fieldSchema) {
    return value;
  }

  const isObject = fieldSchema.type === "object";
  if (isObject) {
    const newItem: Record<string, unknown> = {};
    const entries = Object.entries(value as Record<string, unknown>);
    for (const [key, value] of entries) {
      newItem[key] = getValueFromCodec({ fieldSchema: (fieldSchema as z.ZodObject).shape[key], method, value });
    }
    return newItem;
  }

  const isArray = isZodArray(fieldSchema);
  if (!isArray) {
    return getValueWithCodec({ fieldSchema, method, parentSchema, value });
  }

  const valueAsArray: unknown[] = /* c8 ignore next */ Array.isArray(value) ? value : [value];
  return valueAsArray.map(item => {
    const unwrappedSchema = getUnwrappedSchema(fieldSchema);
    return getValueFromCodec({
      fieldSchema:
        /* c8 ignore next */ "element" in unwrappedSchema ? (unwrappedSchema.element as z.ZodType) : unwrappedSchema,
      method,
      parentSchema: (fieldSchema as z.ZodArray<z.ZodType>).unwrap(),
      value: item,
    });
  });
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
    const fieldSchema = shape[key] as z.ZodType;
    const metadata = getFieldMetadata(fieldSchema);

    if (!shouldIncludeField(fieldSchema, metadata, data)) {
      continue;
    }

    // Apply keyOut mapping if provided
    const { keyOut } = getKeyMapping(metadata);
    const outputKey = keyOut ?? key;
    const valueWithCodec = getValueFromCodec({ fieldSchema, method: "encode", value });
    // Check if outputKey contains a dot (nested path)
    if (outputKey.includes(".")) {
      setNested(result, outputKey, valueWithCodec);
    } else {
      result[outputKey] = valueWithCodec;
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
    if (schema === undefined) {
      logger.info("normalizeData detected undefined schema", { data, schemas });
    }
    cleanedData = normalizeDataForSchema(schema, cleanedData);
  }
  return cleanedData;
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
      const fieldSchema = shape[key] as z.ZodType;
      if (!fieldSchema) {
        continue;
      }
      const metadata = getFieldMetadata(fieldSchema);
      if (shouldIncludeField(fieldSchema, metadata, data)) {
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

// oxlint-disable-next-line max-statements, max-lines-per-function
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
    const fieldSchema = shape[key] as z.ZodType;
    /* c8 ignore start */
    if (!fieldSchema) {
      continue;
    }
    /* c8 ignore stop */
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
    if (shouldIncludeField(fieldSchema, metadata, data)) {
      currentSectionData[key] = {
        /* c8 ignore start */
        label: metadata?.label ?? key,
        /* c8 ignore stop */
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
export async function mockSubmit(
  status: AutoFormSubmissionStepProps["status"],
  message: ReactNode,
): Promise<{ submission: AutoFormSubmissionStepProps }> {
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
export function field<Schema extends z.ZodType>(fieldSchema: Schema, fieldMetadata?: AutoFormFieldMetadata) {
  if (fieldMetadata === undefined) {
    return fieldSchema;
  }
  return fieldSchema.meta(fieldMetadata);
}

/**
 * Helper to write AutoForm Accept field
 * @param fieldMetadata related metadata
 * @returns field schema with valid metadata
 * @example acceptField({ label: "First-name", labels: { accept: "Confirmation", reject: "Non-confirmation" } })
 */
export function acceptField(fieldMetadata: Omit<AutoFormAcceptFieldMetadata, "render">) {
  return z.boolean().meta({ ...fieldMetadata, render: "accept" });
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
export function step<Schema extends z.ZodObject>(stepSchema: Schema, stepMetadata?: AutoFormStepMetadata) {
  if (!stepMetadata) {
    return stepSchema;
  }
  return stepSchema.meta(stepMetadata);
}

/**
 * Helper to create a Zod array schema with optional min and max items constraints.
 * @param schema - The Zod schema for the array items.
 * @param minItems - Optional minimum number of items.
 * @param maxItems - Optional maximum number of items.
 * @returns A Zod array schema with the specified constraints.
 */
function toZodArray<Schema extends z.ZodType>(schema: Schema, minItems?: number, maxItems?: number) {
  return z
    .array(schema)
    .min(minItems ?? 0, `At least ${minItems === 1 ? "one item is" : `${minItems} items are`} required.`) // NOSONAR
    .max(maxItems ?? Infinity, `At most ${maxItems === 1 ? "one item is" : `${maxItems} items are`} allowed.`) // NOSONAR
    .prefault([]);
}

/**
 * Helper to write AutoForm repeatable fields
 * @param fieldSchema zod schema
 * @param fieldsMetadata related metadata
 * @returns fields schema with valid metadata
 * @example fields(z.object({ firstName: field(...) }), { identifier: data => `${data.firstName}` })
 */
export function fields<Schema extends z.ZodType>(
  fieldSchema: Schema,
  fieldsMetadata?: Omit<AutoFormFieldsMetadata, "render">,
) {
  if (fieldsMetadata === undefined) {
    return toZodArray(fieldSchema).meta({ render: "field-list" });
  }
  const { minItems, maxItems } = fieldsMetadata;
  return toZodArray(fieldSchema, minItems, maxItems).meta({ ...fieldsMetadata, render: "field-list" });
}

/**
 * Helper to write AutoForm repeatable form
 * @param formSchema zod schema
 * @param formsMetadata related metadata
 * @returns form schema with valid metadata
 * @example forms(z.object({ firstName: field(...) }), { identifier: data => `${data.firstName}` })
 */
export function forms(formSchema: z.ZodObject, formsMetadata?: Omit<AutoFormFormsMetadata, "render">) {
  if (formsMetadata === undefined) {
    return toZodArray(formSchema).meta({ render: "form-list" });
  }
  const { minItems, maxItems } = formsMetadata;
  return toZodArray(formSchema, minItems, maxItems).meta({ ...formsMetadata, render: "form-list" });
}

/**
 * Determines which form field component should render the given field schema.
 * Checks the explicit render property first, then falls back to schema type detection.
 * @param fieldSchema the Zod schema for the field
 * @returns the component name to render like 'text', 'number', 'date', etc... Undefined if no suitable component found.
 */
export function getFormFieldRender(fieldSchema: z.ZodType): AutoFormFieldMetadata["render"] {
  const metadata = getFieldMetadata(fieldSchema) || {};
  const schema = getUnwrappedSchema(fieldSchema);
  const { render } = metadata;
  if (render) {
    return render;
  }
  if (isZodFile(schema)) {
    return "upload";
  }
  if (isZodDate(schema)) {
    return "date";
  }
  if (isZodEnum(schema)) {
    return "select";
  }
  if (isZodNumber(schema)) {
    return "number";
  }
  if (isZodBoolean(schema)) {
    return "boolean";
  }
  if (isZodString(schema)) {
    return "text";
  }
  return undefined;
}

/**
 * Determines which form step should be displayed on form load.
 *
 * @param schemas Array of Zod schemas for all steps
 * @param showFirstEditableStep whether to automatically show the first editable step on form load
 * @param showLastStep whether to automatically show the last available step on form load
 * @returns initial step index (default to first step)
 */
export function getInitialStep(schemas: z.ZodObject[], showFirstEditableStep?: boolean, showLastStep?: boolean) {
  if (showFirstEditableStep) {
    const firstEditableStepIndex = schemas.findIndex(stepSchema => {
      const stepState = getStepMetadata(stepSchema)?.state;

      // Find the first editable step.
      return stepState === undefined || stepState === "editable";
    });

    // If first editable step cannot be found in the schemas, return default step.
    return firstEditableStepIndex === -1 ? 0 : firstEditableStepIndex;
  }

  if (showLastStep) {
    return schemas.length - 1;
  }

  return 0;
}

/**
 * Computes the default values for all form fields across all schemas.
 * @param schemas - Array of Zod schemas for all steps
 * @param initialData - Initial data to map to form fields
 * @returns Combined default values for all schemas
 */
export function getDefaultValues(schemas: z.ZodObject[], initialData: AutoFormData) {
  const allMappedData: AutoFormData = {};
  for (const schema of schemas) {
    if (schema === undefined) {
      logger.info("getDefaultValues detected undefined schema", schemas);
    }
    const schemaMappedData = mapExternalDataToFormFields(schema, initialData);
    Object.assign(allMappedData, schemaMappedData);
  }
  return allMappedData;
}

/**
 * Finds the index of the last accessible (non-upcoming) step.
 * @param schemas - Array of Zod schemas for all steps
 * @returns Index of the last accessible step
 */
export function getLastAccessibleStepIndex(schemas: z.ZodObject[]) {
  for (let index = schemas.length - 1; index >= 0; index -= 1) {
    const stepMeta = getStepMetadata(schemas[index]);
    if (stepMeta?.state !== "upcoming") {
      return index;
    }
  }
  return schemas.length - 1;
}

/**
 * Checks if a step can be clicked based on submission status and step state.
 * @param schemas - Array of Zod schemas for all steps
 * @param stepIndex - Index of the step to check
 * @param submissionStatus - Current submission status
 * @returns true if the step can be clicked
 */
export function isStepClickable(schemas: z.ZodObject[], stepIndex: number, submissionStatus?: string) {
  if (submissionStatus === "success" || submissionStatus === "warning") {
    return false;
  }
  const stepMeta = getStepMetadata(schemas[stepIndex]);
  return stepMeta?.state !== "upcoming";
}

type BuildStepperStepsOptions = {
  schemas: z.ZodObject[];
  currentStep: number;
  showSummary: boolean;
  hasSubmission: boolean;
  icons: Record<NonNullable<AutoFormStepMetadata["state"]>, ReactNode>;
};

/**
 * Builds the stepper steps array from schemas.
 * @param options options for building steps
 * @param options.schemas Array of Zod schemas for all steps
 * @param options.currentStep Current active step index
 * @param options.showSummary Whether the summary step is shown
 * @param options.hasSubmission Whether a submission has occurred
 * @param options.icons Icons for each step state
 * @returns Array of stepper steps
 */
export function buildStepperSteps({
  schemas,
  currentStep,
  showSummary,
  hasSubmission,
  icons,
}: BuildStepperStepsOptions) {
  let lastSection = "" as AutoFormStepMetadata["section"];
  return schemas.map((schema, idx) => {
    const stepMeta = getStepMetadata(schema);
    const { title = `Step ${idx + 1}`, subtitle, suffix, section: currentSection, state: metaState } = stepMeta ?? {};
    const section = currentSection !== lastSection && currentSection ? currentSection : undefined;
    lastSection = currentSection;
    const state = metaState ?? "editable";
    return {
      active: idx === currentStep && !showSummary && !hasSubmission,
      icon: icons[state],
      idx,
      section,
      state,
      subtitle,
      suffix,
      title,
    };
  });
}

/**
 * Check if a form data seems filled
 * @param data the data to check
 * @returns true if it seems filled
 */
export function isSubformFilled(data: AutoFormData): boolean {
  return Object.values(data).some(value => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    if (isEmptyObject(value)) {
      return false;
    }
    // @ts-expect-error type issue
    // oxlint-disable-next-line unicorn/no-null
    return ![undefined, null, "", false].includes(value);
  });
}

/**
 * Resolves a TypeLike value to its actual type.
 * @param value - A value that can be either of type Type or a function that returns Type
 * @param data - Optional AutoFormData to pass to the resolver function if value is a function
 * @returns The resolved value of type Type. If value is a function, it will be called with data and its result returned. Otherwise, value is returned as-is.
 * @example typeLikeResolver((data) => data.name, { name: "John" }); // returns "John"
 */
export function typeLikeResolver<Type>(value: TypeLike<Type>, data?: AutoFormData): Type {
  if (isFunction(value)) {
    logger.info("Resolving TypeLike value using provided data", { data, value });
    return value(data);
  }
  return value;
}
