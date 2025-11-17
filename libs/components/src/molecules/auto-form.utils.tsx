// oxlint-disable max-lines
import { getNested, Logger, nbPercentMax, Result, setNested, sleep, stringify } from '@monorepo/utils'
import type { ReactNode } from 'react'
import { z } from 'zod'
import { IconEdit } from '../icons/icon-edit'
import { IconReadonly } from '../icons/icon-readonly'
import { IconSuccess } from '../icons/icon-success'
import type { AutoFormFieldMetadata, AutoFormProps, AutoFormStepMetadata, AutoFormSubmissionStepProps, SelectOption } from './auto-form.types'

/**
 * Gets the enum options from a Zod schema if it is a ZodEnum or an optional ZodEnum.
 * Returns an array of {label, value} objects. If custom options are provided in metadata, they are used.
 * Otherwise, enum values are converted to label/value pairs with capitalized labels.
 * @param fieldSchema the Zod schema to check
 * @returns the array of enum options as {label, value} objects
 */
export function getZodEnumOptions(fieldSchema: z.ZodType) {
  const metadata = getFieldMetadata(fieldSchema)
  if (metadata?.options) return Result.ok(metadata.options)
  let rawOptions: string[] = []
  if (fieldSchema.type === 'enum') rawOptions = (fieldSchema as z.ZodEnum).options as string[]
  else if (fieldSchema.type === 'optional' && (fieldSchema as z.ZodOptional<z.ZodEnum>).def.innerType.type === 'enum') rawOptions = (fieldSchema as z.ZodOptional<z.ZodEnum>).def.innerType.options as string[]
  else return Result.error('failed to get enum options from schema')
  const options: SelectOption[] = rawOptions.map(option => ({
    label: option.charAt(0).toUpperCase() + option.slice(1),
    value: option,
  }))
  return Result.ok(options)
}

/**
 * Checks if the provided Zod schema is a ZodEnum or contains a ZodEnum as its inner type (e.g., optional enum).
 * @param fieldSchema the Zod schema to check
 * @returns true if the schema is (or contains) a ZodEnum; otherwise, false.
 */
export function isZodEnum(fieldSchema: z.ZodType) {
  if (fieldSchema.type === 'enum') return true
  else if (fieldSchema.type === 'optional' && (fieldSchema as z.ZodOptional<z.ZodEnum>).def.innerType.type === 'enum') return true
  return false
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
  let isBoolean = false
  let isBooleanLiteral = false
  let booleanLiteralValue = false
  /* v8 ignore else -- @preserve */
  if (fieldSchema.type === 'boolean') isBoolean = true
  else if (fieldSchema.type === 'literal') {
    isBooleanLiteral = (fieldSchema as z.ZodLiteral).value === true || (fieldSchema as z.ZodLiteral).value === false
    isBoolean = isBooleanLiteral
    booleanLiteralValue = Boolean((fieldSchema as z.ZodLiteral).value)
  } else if (fieldSchema.type === 'optional' && (fieldSchema as z.ZodOptional<z.ZodBoolean>).def.innerType.type === 'boolean') isBoolean = true
  return { booleanLiteralValue, isBoolean, isBooleanLiteral }
}

/**
 * Checks if the provided Zod schema is a ZodBoolean or contains a ZodBoolean as its inner type (e.g., optional boolean).
 * @param fieldSchema the Zod schema to check
 * @returns true if the schema is (or contains) a ZodBoolean; otherwise, false.
 */
export function isZodBoolean(fieldSchema: z.ZodType) {
  if (fieldSchema.type === 'boolean') return true
  else if (fieldSchema.type === 'literal') {
    const value = (fieldSchema as z.ZodLiteral).value
    if (value === true || value === false) return true
  } else if (fieldSchema.type === 'optional' && (fieldSchema as z.ZodOptional<z.ZodBoolean>).def.innerType.type === 'boolean') return true
  return false
}

/**
 * Checks if the provided Zod schema is a ZodNumber or contains a ZodNumber as its inner type (e.g., optional number).
 * @param fieldSchema the Zod schema to check
 * @returns true if the schema is (or contains) a ZodNumber; otherwise, false.
 */
export function isZodNumber(fieldSchema: z.ZodType) {
  if (fieldSchema.type === 'number') return true
  else if (fieldSchema.type === 'optional' && (fieldSchema as z.ZodOptional<z.ZodNumber>).def.innerType.type === 'number') return true
  return false
}

/**
 * Checks if the provided Zod schema is a ZodFile or contains a ZodFile as its inner type (e.g., optional file).
 * @param fieldSchema the Zod schema to check
 * @returns true if the schema is (or contains) a ZodFile; otherwise, false.
 */
export function isZodFile(fieldSchema: z.ZodType) {
  if (fieldSchema.type === 'file') return true
  else if (fieldSchema.type === 'optional' && (fieldSchema as z.ZodOptional<z.ZodFile>).def.innerType.type === 'file') return true
  return false
}

/**
 * Checks if the provided Zod schema is a ZodDate or contains a ZodDate as its inner type (e.g., optional date).
 * @param fieldSchema the Zod schema to check
 * @returns true if the schema is (or contains) a ZodDate; otherwise, false.
 */
export function isZodDate(fieldSchema: z.ZodType) {
  if (fieldSchema.type === 'date') return true
  else if (fieldSchema.type === 'optional' && (fieldSchema as z.ZodOptional<z.ZodDate>).def.innerType.type === 'date') return true
  return false
}

/**
 * Checks if the provided Zod schema is a ZodString or contains a ZodString as its inner type (e.g., optional string).
 * @param fieldSchema the Zod schema to check
 * @returns true if the schema is (or contains) a ZodString; otherwise, false.
 */
export function isZodString(fieldSchema: z.ZodType) {
  if (fieldSchema.type === 'string') return true
  if (fieldSchema.type === 'optional' && (fieldSchema as z.ZodOptional<z.ZodString>).def.innerType.type === 'string') return true
  return false
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
  const equalsIndex = dependsOn.indexOf('=')
  if (equalsIndex === -1) return { fieldName: dependsOn }
  return {
    expectedValue: dependsOn.slice(equalsIndex + 1),
    fieldName: dependsOn.slice(0, equalsIndex),
  }
}

/**
 * Determines whether a form field should be visible based on its schema metadata and the current form data.
 * @param fieldSchema the Zod schema for the field, which may contain metadata describing dependencies.
 * @param formData the current form data as a record of field names to values.
 * @returns `true` if the field should be visible; `false` otherwise.
 */
export function isFieldVisible(fieldSchema: z.ZodType, formData: Record<string, unknown>): boolean {
  const metadata = getFieldMetadata(fieldSchema)
  if (!metadata?.dependsOn) return true
  const { fieldName, expectedValue } = parseDependsOn(metadata.dependsOn)
  const fieldValue = formData[fieldName]
  // If expectedValue is specified, check for equality
  if (expectedValue !== undefined) return stringify(fieldValue) === expectedValue
  // Otherwise, check for truthiness
  return Boolean(fieldValue)
}

/**
 * Returns a filtered schema with only visible fields
 * @param schema the original Zod schema
 * @param formData the current form data to evaluate visibility
 * @returns a new Zod schema with only visible fields
 */
export function filterSchema(schema: z.ZodObject, formData: Record<string, unknown>): z.ZodObject {
  const shape = schema.shape
  const visibleShape: Record<string, z.ZodTypeAny> = {}
  for (const key of Object.keys(shape)) {
    const fieldSchema = shape[key] as z.ZodTypeAny
    if (!isFieldVisible(fieldSchema, formData)) continue
    visibleShape[key] = fieldSchema
  }
  return z.object(visibleShape)
}

/**
 * Gets the effective key mapping for a field by resolving key, keyIn, and keyOut metadata.
 * @param metadata - The field metadata object
 * @returns An object with keyIn and keyOut properties
 */
export function getKeyMapping(metadata?: AutoFormFieldMetadata): { keyIn: string | undefined; keyOut: string | undefined } {
  if (!metadata) return { keyIn: undefined, keyOut: undefined }
  // If key is provided, use it for both in and out
  if (metadata.key) return { keyIn: metadata.key, keyOut: metadata.key }
  // Otherwise use keyIn and keyOut if provided
  return { keyIn: metadata.keyIn, keyOut: metadata.keyOut }
}

/**
 * Maps initial data using keyIn from schema metadata to match field names.
 * @param schema - The Zod schema object describing the form fields
 * @param externalData - The external data object with potentially different key names
 * @returns A new object with data mapped to schema field names using keyIn mappings
 */
export function mapExternalDataToFormFields(schema: z.ZodObject, externalData: Record<string, unknown>): Record<string, unknown> {
  const shape = schema.shape
  const result: Record<string, unknown> = {}
  for (const fieldName of Object.keys(shape)) {
    const fieldSchema = shape[fieldName] as z.ZodTypeAny
    const metadata = getFieldMetadata(fieldSchema)
    const { keyIn } = getKeyMapping(metadata)
    // Use keyIn if provided, otherwise use field name
    const sourceKey = keyIn ?? fieldName
    // Check if sourceKey contains a dot (nested path)
    if (sourceKey.includes('.')) {
      const value = getNested(externalData, sourceKey)
      if (value !== undefined) result[fieldName] = value
    } else if (sourceKey in externalData) result[fieldName] = externalData[sourceKey]
  }
  return result
}

/**
 * Cleans the submitted form data by filtering out fields that are not visible or are marked as excluded in the schema metadata.
 * Also applies keyOut mapping to convert field names back to external data format.
 * @param schema - The Zod schema object describing the form fields.
 * @param data - The submitted data object to be cleaned.
 * @returns A new object containing only the fields that are visible and not excluded according to the schema, with keyOut mappings applied.
 */
export function normalizeDataForSchema(schema: z.ZodObject, data: Record<string, unknown>): Record<string, unknown> {
  const shape = schema.shape
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    const fieldSchema = shape[key] as z.ZodTypeAny
    const metadata = getFieldMetadata(fieldSchema)
    if (!isFieldVisible(fieldSchema, data)) continue
    if (metadata?.excluded) continue
    // Apply keyOut mapping if provided
    const { keyOut } = getKeyMapping(metadata)
    const outputKey = keyOut ?? key
    // Check if outputKey contains a dot (nested path)
    if (outputKey.includes('.')) setNested(result, outputKey, value)
    else result[outputKey] = value
  }
  return result
}

/**
 * Cleans form data across all schemas by removing invisible/excluded fields from each schema.
 * @param schemas - Array of Zod schemas to clean data against
 * @param data - The form data to clean
 * @returns Cleaned data with invisible/excluded fields removed
 */
export function normalizeData(schemas: z.ZodObject[], data: Record<string, unknown>): Record<string, unknown> {
  let cleanedData = data
  for (const schema of schemas) cleanedData = normalizeDataForSchema(schema, cleanedData)
  return cleanedData
}

/**
 * Mocks the submission of an auto-form to an external API
 * @param status the status to simulate
 * @param message the message to shows on submission step
 * @returns the simulated submission result
 */
export async function mockSubmit(status: AutoFormSubmissionStepProps['status'], message: ReactNode): Promise<{ submission: AutoFormSubmissionStepProps }> {
  const logger = new Logger()
  await sleep(nbPercentMax) // simulate api/network delay
  const submission: AutoFormSubmissionStepProps = {
    children: message,
    detailsList: [] as string[],
    status,
  }
  if (status === 'warning') {
    submission.detailsList = ['Some fields have warnings.', 'Submission is complete anyway.']
    logger.showInfo('Form submitted with warnings.')
  } else if (status === 'success') {
    submission.detailsList = ['All data is valid.', 'No errors found.']
    logger.showSuccess('Form submitted successfully!')
  } else {
    submission.detailsList = ['Network error occurred.', 'Please retry submission.']
    logger.showError('Form submission failed.')
  }
  return { submission }
}

export const defaultLabels = {
  homeButton: 'Return to Homepage',
  lastStepButton: 'Submit',
  nextStep: 'Next',
  previousStep: 'Back',
  summaryStepButton: 'Proceed',
} satisfies AutoFormProps['labels']

export const defaultIcons = {
  edit: <IconEdit className="text-muted-foreground size-6" />,
  readonly: <IconReadonly className="text-muted-foreground size-6" />,
  success: <IconSuccess className="text-success size-6" />,
}

/**
 * Gets metadata from a Zod field schema if it exists.
 * @param fieldSchema - The Zod schema to extract metadata from
 * @returns The metadata object or undefined if not present
 */
export function getFieldMetadata(fieldSchema?: z.ZodType): AutoFormFieldMetadata | undefined {
  if (!fieldSchema || typeof fieldSchema.meta !== 'function') return undefined
  return fieldSchema.meta() as AutoFormFieldMetadata
}

/**
 * Gets step metadata from a Zod object schema if it exists.
 * @param stepSchema - The Zod object schema to extract metadata from
 * @returns The step metadata object or undefined if not present
 */
export function getStepMetadata(stepSchema: z.ZodObject): AutoFormStepMetadata | undefined {
  if (typeof stepSchema.meta !== 'function') return undefined
  return stepSchema.meta() as AutoFormStepMetadata
}

/**
 * Determines which form field component should render the given field schema.
 * Checks the explicit render property first, then falls back to schema type detection.
 * @param fieldSchema the Zod schema for the field
 * @returns the component name to render like 'text', 'number', 'date', etc... Undefined if no suitable component found.
 */
export function getFormFieldRender(fieldSchema: z.ZodType): AutoFormFieldMetadata['render'] {
  const { render } = getFieldMetadata(fieldSchema) || {}
  if (render) return render
  if (isZodFile(fieldSchema)) return 'upload'
  if (isZodDate(fieldSchema)) return 'date'
  if (isZodEnum(fieldSchema)) return 'select'
  if (isZodNumber(fieldSchema)) return 'number'
  if (isZodBoolean(fieldSchema)) return 'boolean'
  if (isZodString(fieldSchema)) return 'text'
  return undefined
}
