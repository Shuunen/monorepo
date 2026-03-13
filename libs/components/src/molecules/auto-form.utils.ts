// oxlint-disable max-lines
import { getNested, isString, Logger, nbPercentMax, Result, setNested, sleep, stringify } from "@monorepo/utils";
import { isFunction } from "es-toolkit";
import type { ReactNode } from "react";
import { z } from "zod";
import type {
  AutoFormData,
  AutoFormFieldAcceptMetadata,
  AutoFormFieldFieldsMetadata,
  AutoFormFieldFormsMetadata,
  AutoFormFieldMetadata,
  AutoFormFieldSectionMetadata,
  AutoFormStepMetadata,
  AutoFormSubmissionStepProps,
  DependsOnCondition,
  TypeLike,
} from "./auto-form.types";

const logger = new Logger();

/**
 * Gets metadata from a Zod field schema if it exists.
 * @param fieldSchema - The Zod schema to extract metadata from
 * @returns The metadata object or undefined if not present
 */
export function getFieldMetadata(fieldSchema?: z.ZodType): AutoFormFieldMetadata | undefined {
  if (!fieldSchema || typeof fieldSchema.meta !== "function") {
    return undefined;
  }
  // oxlint-disable-next-line monorepo-plugin/no-restricted-syntax
  return fieldSchema.meta() as AutoFormFieldMetadata;
}

export function getUnwrappedSchema(schema: z.ZodType) {
  if ("unwrap" in schema && ["default", "optional", "prefault"].includes(schema.type)) {
    return getUnwrappedSchema((schema as z.ZodOptional<z.ZodType>).unwrap());
  }
  return schema;
}

/**
 * Checks if the provided Zod schema is a specific Zod type
 * @param fieldSchema the Zod schema to check
 * @param type the Zod type to check
 * @returns true if the schema is (or contains) this zod type
 */
function isZodType(fieldSchema: z.ZodType, type: z.ZodType["type"]) {
  const schema = getUnwrappedSchema(fieldSchema);
  return schema.type === type;
}

/**
 * Checks if the provided Zod schema is a ZodEnum or contains a ZodEnum as its inner type (e.g., optional enum).
 * @param fieldSchema the Zod schema to check
 * @returns true if the schema is (or contains) a ZodEnum; otherwise, false.
 */
export function isZodEnum(fieldSchema: z.ZodType) {
  return isZodType(fieldSchema, "enum");
}

/**
 * Checks if the provided Zod schema is a ZodBoolean or contains a ZodBoolean as its inner type (e.g., optional boolean).
 * @param fieldSchema the Zod schema to check
 * @returns true if the schema is (or contains) a ZodBoolean; otherwise, false.
 */
export function isZodBoolean(fieldSchema: z.ZodType) {
  const schema = getUnwrappedSchema(fieldSchema);
  return isZodBooleanLiteral(schema) || schema.type === "boolean";
}

/**
 * Checks if the provided Zod schema is a ZodLiteral of boolean type (true or false).
 * @param unwrappedSchema the Zod schema to check
 * @returns true if the schema is a ZodLiteral with a boolean value; otherwise, false.
 */
function isZodBooleanLiteral(unwrappedSchema: z.ZodType) {
  const isLiteral = unwrappedSchema.type === "literal";
  const hasTrueFalseValues = [true, false].includes((unwrappedSchema as z.ZodLiteral<boolean>).value);
  return isLiteral && hasTrueFalseValues;
}

/**
 * Checks if the provided Zod schema is a required boolean (not optional, not with a default).
 * A required boolean must be set to true by the user (e.g. "I agree to terms").
 * @param fieldSchema the Zod schema to check
 * @returns true if the schema is a required ZodBoolean
 */
export function isRequiredBoolean(fieldSchema: z.ZodType) {
  if (["default", "prefault"].includes(fieldSchema.type)) {
    return (fieldSchema as z.ZodDefault<z.ZodType>).unwrap().type === "boolean";
  }
  return fieldSchema.type === "boolean";
}

/**
 * Checks if the provided Zod schema is a ZodNumber or contains a ZodNumber as its inner type (e.g., optional number).
 * @param fieldSchema the Zod schema to check
 * @returns true if the schema is (or contains) a ZodNumber; otherwise, false.
 */
export function isZodNumber(fieldSchema: z.ZodType) {
  return isZodType(fieldSchema, "number");
}

/**
 * Checks if the provided Zod schema is a ZodFile or contains a ZodFile as its inner type (e.g., optional file).
 * @param fieldSchema the Zod schema to check
 * @returns true if the schema is (or contains) a ZodFile; otherwise, false.
 */
export function isZodFile(fieldSchema: z.ZodType) {
  return isZodType(fieldSchema, "file");
}

/**
 * Checks if the provided Zod schema is a ZodDate or contains a ZodDate as its inner type (e.g., optional date).
 * @param fieldSchema the Zod schema to check
 * @returns true if the schema is (or contains) a ZodDate; otherwise, false.
 */
export function isZodDate(fieldSchema: z.ZodType) {
  const isDate = isZodType(fieldSchema, "date");
  const isDateString = fieldSchema.type === "string" && (fieldSchema as z.ZodString).format === "date";
  return isDate || isDateString;
}

/**
 * Checks if the provided Zod schema is a ZodArray or contains a ZodArray as its inner type (e.g., optional array).
 * @param fieldSchema the Zod schema to check
 * @returns true if the schema is (or contains) a ZodArray; otherwise, false.
 */
export function isZodArray(fieldSchema: z.ZodType) {
  return isZodType(fieldSchema, "array");
}

/**
 * Checks if the provided Zod schema is a ZodObject or contains a ZodObject as its inner type (e.g., optional object).
 * @param fieldSchema the Zod schema to check
 * @returns true if the schema is (or contains) a ZodObject; otherwise, false.
 */
export function isZodObject(fieldSchema: z.ZodType) {
  return isZodType(fieldSchema, "object");
}

/**
 * Checks if the provided Zod schema is a ZodString or contains a ZodString as its inner type (e.g., optional string).
 * @param fieldSchema the Zod schema to check
 * @returns true if the schema is (or contains) a ZodString; otherwise, false.
 */
export function isZodString(fieldSchema: z.ZodType) {
  return isZodType(fieldSchema, "string");
}

export type DependsOnOperator = "=" | "!=" | ">" | "<" | ">=" | "<=";

export type ParsedDependsOn = {
  fieldName: string;
  expectedValue?: string;
  operator?: DependsOnOperator;
};

/**
 * Parses a dependsOn string to extract field name and optional expected value.
 * Supports formats like:
 * - 'fieldName' - checks if fieldName is truthy
 * - 'fieldName=value' - checks if fieldName equals value
 * - 'fieldName!=value' - checks if fieldName is different from value
 * - 'fieldName>value' - checks if fieldName is greater than value
 * - 'fieldName<value' - checks if fieldName is less than value
 * - 'fieldName>=value' - checks if fieldName is greater than or equal to value
 * - 'fieldName<=value' - checks if fieldName is less than or equal to value
 * @param dependsOn the dependsOn string to parse
 * @returns an object with fieldName, optional expectedValue, and optional operator
 */
export function parseDependsOnSingleValue(dependsOn: string): ParsedDependsOn {
  const operators = [">=", "<=", "!=", ">", "<", "="] as const;
  let selectedOperator: DependsOnOperator | undefined = undefined;
  let selectedIndex = Number.POSITIVE_INFINITY;
  for (const op of operators) {
    const index = dependsOn.indexOf(op);
    if (index === -1) {
      continue;
    }
    const isEarlierOperator = index < selectedIndex;
    const isLongerOperatorAtSameIndex =
      index === selectedIndex && (selectedOperator === undefined || op.length > selectedOperator.length);
    if (isEarlierOperator || isLongerOperatorAtSameIndex) {
      selectedIndex = index;
      selectedOperator = op;
    }
  }
  if (selectedOperator !== undefined) {
    return {
      expectedValue: dependsOn.slice(selectedIndex + selectedOperator.length),
      fieldName: dependsOn.slice(0, selectedIndex),
      operator: selectedOperator,
    };
  }
  return { fieldName: dependsOn };
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
    if (operator === "=" || operator === "!=") {
      const isEqual = stringify(fieldValue) === expectedValue;
      return operator === "!=" ? !isEqual : isEqual;
    }
    // Comparison operators: parse as numbers
    const numFieldValue = Number.parseFloat(String(fieldValue));
    const numExpectedValue = Number.parseFloat(expectedValue);
    if (operator === ">") {
      return numFieldValue > numExpectedValue;
    }
    if (operator === "<") {
      return numFieldValue < numExpectedValue;
    }
    if (operator === ">=") {
      return numFieldValue >= numExpectedValue;
    }
    return numFieldValue <= numExpectedValue;
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

export function getElementSchema(fieldSchema: z.ZodType) {
  const schema = getUnwrappedSchema(fieldSchema);
  if (!isZodArray(schema)) {
    logger?.error("cant get element of a non-array schema");
    return Result.error("cant get element of a non-array schema");
  }
  return Result.ok((schema as z.ZodArray<z.ZodType>).element);
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
 * Helper to write AutoForm repeatable form
 * @param formSchema zod schema
 * @param formsMetadata related metadata
 * @returns form schema with valid metadata
 * @example forms(z.object({ firstName: field(...) }), { identifier: data => `${data.firstName}` })
 */
export function forms(formSchema: z.ZodObject, formsMetadata: Omit<AutoFormFieldFormsMetadata, "render"> = {}) {
  const { maxItems } = formsMetadata;
  const schema = toZodArray(formSchema, undefined, maxItems);
  return field(schema, { ...formsMetadata, render: "form-list" });
}

/**
 * Checks if a field should be excluded from the filtered validation schema.
 * @param fieldSchema the Zod schema of the field
 * @param formData the current form data
 * @param metadata the field metadata
 * @returns true if the field should be excluded from validation
 */
function isFilteredOut(fieldSchema: z.ZodType, formData: AutoFormData, metadata?: AutoFormFieldMetadata) {
  if (!isFieldVisible(fieldSchema, formData)) {
    return true;
  }
  if (metadata?.render === "section") {
    return true;
  }
  if (metadata && "state" in metadata && metadata.state === "readonly") {
    return true;
  }
  if (isZodArray(fieldSchema)) {
    const result = getElementSchema(fieldSchema);
    if (result.ok && isZodObject(result.value)) {
      return true;
    }
  }
  return false;
}

/**
 * Returns a filtered schema with only visible fields.
 * @param schema the original Zod schema
 * @param formData the current form data to evaluate visibility
 * @returns a new Zod schema with only visible fields
 */
export function filterSchema(schema: z.ZodObject, formData: AutoFormData = {}): z.ZodObject {
  const { shape } = schema;
  const visibleShape: Record<string, z.ZodType> = {};
  for (const key of Object.keys(shape)) {
    const fieldSchema = shape[key] as z.ZodType;
    const metadata = getFieldMetadata(fieldSchema);
    if (isFilteredOut(fieldSchema, formData, metadata)) {
      continue;
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
    /* v8 ignore start */
    if (!result.ok) {
      logger.error("Failed to apply codec", { metadata, method, value });
      return undefined;
    }
    /* v8 ignore end */
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
    for (const [key, valueLocal] of entries) {
      newItem[key] = getValueFromCodec({
        fieldSchema: (fieldSchema as z.ZodObject).shape[key],
        method,
        value: valueLocal,
      });
    }
    return newItem;
  }

  const isArray = isZodArray(fieldSchema);
  if (!isArray) {
    return getValueWithCodec({ fieldSchema, method, parentSchema, value });
  }

  const valueAsArray: unknown[] = /* v8 ignore next */ Array.isArray(value) ? value : [value];
  return valueAsArray.map(item => {
    const unwrappedSchema = getUnwrappedSchema(fieldSchema);
    return getValueFromCodec({
      fieldSchema:
        /* v8 ignore next */ "element" in unwrappedSchema ? (unwrappedSchema.element as z.ZodType) : unwrappedSchema,
      method,
      parentSchema: (fieldSchema as z.ZodArray<z.ZodType>).unwrap(),
      value: item,
    });
  });
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
    return undefined;
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
  const { shape } = schema;
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

export function shouldIncludeField(
  fieldSchema: z.ZodType,
  metadata: AutoFormFieldMetadata | undefined,
  data: AutoFormData,
) {
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

/**
 * Cleans the submitted form data by filtering out fields that are not visible or are marked as excluded in the schema metadata.
 * Also applies keyOut mapping to convert field names back to external data format.
 * @param schema - The Zod schema object describing the form fields.
 * @param data - The submitted data object to be cleaned.
 * @param originalData - The original form data before submission, used to evaluate visibility of fields.
 * @returns A new object containing only the fields that are visible and not excluded according to the schema, with keyOut mappings applied.
 */
function normalizeDataForSchema(schema: z.ZodObject, data: AutoFormData, originalData: AutoFormData) {
  const { shape } = schema;
  const result: AutoFormData = {};
  for (const [key, value] of Object.entries(data)) {
    const fieldSchema = shape[key] as z.ZodType;
    const metadata = getFieldMetadata(fieldSchema);

    if (!shouldIncludeField(fieldSchema, metadata, originalData)) {
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
    cleanedData = normalizeDataForSchema(schema, cleanedData, data);
  }
  return cleanedData;
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
  // oxlint-disable-next-line monorepo-plugin/no-restricted-syntax
  return stepSchema.meta() as AutoFormStepMetadata;
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
 * Extracts the default value from a Zod schema for form field initialization.
 * Handles "default" and "prefault" wrapped schemas via `.def.defaultValue`.
 * For boolean schemas without an explicit default, returns `false` (booleans always have a value).
 * @param fieldSchema - The Zod schema to extract the default value from
 * @returns The default value to initialize the field with, or `undefined` if no initialization is needed
 */
export function getSchemaDefaultValue(fieldSchema: z.ZodType): unknown {
  if (["default", "prefault"].includes(fieldSchema.type)) {
    const innerSchema = (fieldSchema as z.ZodDefault).unwrap() as z.ZodType;
    if (isZodArray(innerSchema)) {
      return undefined;
    }
    return (fieldSchema as z.ZodDefault).def.defaultValue;
  }
  const metadata = getFieldMetadata(fieldSchema);
  if (isZodBoolean(fieldSchema) && metadata?.render !== "accept") {
    return false;
  }
  return undefined;
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
 * Checks all fields in a schema for custom error functions and returns true if any produce an error for the given data.
 * @param schema the Zod object schema to check
 * @param data the current form data
 * @param parentData the parent form's data when in subform mode
 * @returns true if any field has a custom error
 */
export function hasCustomErrors(
  schema: z.ZodObject<Record<string, z.ZodType>>,
  data: AutoFormData,
  parentData?: AutoFormData,
) {
  const { shape } = schema;
  for (const fieldSchema of Object.values(shape)) {
    const metadata = getFieldMetadata(fieldSchema);
    const isVisible = isFieldVisible(fieldSchema, data);
    if (isVisible && metadata && "errors" in metadata && metadata.errors?.(data, parentData)) {
      return true;
    }
  }
  return false;
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
  // oxlint-disable-next-line monorepo-plugin/no-restricted-syntax
  return fieldSchema.meta(fieldMetadata);
}

/**
 * Helper to write AutoForm Accept field
 * @param fieldMetadata related metadata
 * @returns field schema with valid metadata
 * @example acceptField({ label: "First-name", labels: { accept: "Confirmation", reject: "Non-confirmation" } })
 */
export function acceptField(fieldMetadata: Omit<AutoFormFieldAcceptMetadata, "render">) {
  return field(z.boolean(), { ...fieldMetadata, render: "accept" });
}

/**
 * Helper to write AutoForm section
 * @param sectionMetadata related metadata
 * @returns section schema with valid metadata
 * @example section({ title: "General case data", line: true })
 */
export function section(sectionMetadata: Omit<AutoFormFieldSectionMetadata, "render">) {
  const metadata = { ...sectionMetadata, render: "section" } satisfies AutoFormFieldSectionMetadata;
  return field(z.string().optional(), metadata);
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
  // oxlint-disable-next-line monorepo-plugin/no-restricted-syntax
  return stepSchema.meta(stepMetadata as Record<string, unknown>);
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
  fieldsMetadata: Omit<AutoFormFieldFieldsMetadata, "render"> = {},
) {
  const { minItems, maxItems } = fieldsMetadata;
  const schema = toZodArray(fieldSchema, minItems, maxItems);
  return field(schema, { ...fieldsMetadata, render: "field-list" });
}

/**
 * Determines which form field component should render the given field schema.
 * Checks the explicit render property first, then falls back to schema type detection.
 * @param fieldSchema the Zod schema for the field
 * @returns the component name to render like 'text', 'number', 'date', etc... Undefined if no suitable component found.
 */
export function getFormFieldRender(fieldSchema: z.ZodType): AutoFormFieldMetadata["render"] | undefined {
  const metadata = getFieldMetadata(fieldSchema);
  const schema = getUnwrappedSchema(fieldSchema);
  if (metadata?.render) {
    return metadata.render;
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
    return "switch"; // we decided to render booleans as switch by default, but it can be easily changed to checkbox if needed
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
    const activeSection = currentSection !== lastSection && currentSection ? currentSection : undefined;
    lastSection = currentSection;
    const state = metaState ?? "editable";
    return {
      active: idx === currentStep && !showSummary && !hasSubmission,
      icon: icons[state],
      idx,
      section: activeSection,
      state,
      subtitle,
      suffix,
      title,
    };
  });
}

/**
 * Resolves a TypeLike value to its actual type.
 * @param value - A value that can be either of type Type or a function that returns Type
 * @param autoFormData - Optional current form data to pass to the resolver function
 * @param parentData - Optional parent form data (when in subform) to pass to the resolver function
 * @returns The resolved value of type Type. If value is a function, it will be called with autoFormData and parentData and its result returned. Otherwise, value is returned as-is.
 * @example typeLikeResolver((data) => data.name, { name: "John" }); // returns "John"
 */
export function typeLikeResolver<Type>(
  value: TypeLike<Type>,
  autoFormData?: AutoFormData,
  parentData?: AutoFormData,
): Type {
  if (isFunction(value)) {
    logger.debug("Resolving TypeLike value using provided data", { autoFormData, parentData, value });
    return value(autoFormData, parentData);
  }
  return value;
}
