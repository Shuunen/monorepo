import type { Logger } from '@monorepo/utils'
import { z } from 'zod'

/**
 * Props for the AutoForm component, which generates a form based on provided Zod schemas.
 */
export type AutoFormProps<Type extends z.ZodRawShape> = {
  /** Logger instance for logging form events, for debugging purposes. */
  logger?: Logger
  /** An array of Zod object schemas representing each step of the form. */
  schemas: z.ZodObject<Type>[]
  /** Callback function invoked when the form is submitted with the cleaned data. */
  onSubmit?: (data: Record<string, unknown>) => void
  /** Optional callback function invoked whenever the form data changes, providing the cleaned data. */
  onChange?: (data: Record<string, unknown>) => void
  /** Initial data to pre-fill the form fields. */
  initialData?: Record<string, unknown>
}

/**
 * Metadata describing the configuration and behavior of a field in an auto-generated form.
 * example: `z.string().meta({ label: 'First Name', placeholder: 'Enter your first name', state: 'editable' })`
 */
export type AutoFormFieldMetadata = {
  /** The display label for the form field. */
  label?: string
  /** Placeholder text shown in the input when empty. */
  placeholder?: string
  /** The interaction state of the field. */
  state?: 'editable' | 'readonly' | 'disabled'
  /** The name of another field that this field depends on. */
  dependsOn?: string
  /** Whether the field should be excluded from the form. */
  excluded?: boolean
}

/**
 * Checks if the provided Zod schema is a ZodEnum or contains a ZodEnum as its inner type (e.g., optional enum).
 * Returns an object indicating whether the schema is an enum and, if so, provides the enum options.
 * @param fieldSchema the Zod schema to check.
 * @returns An object with:
 *   - `enumOptions`: The array of enum option strings if found, otherwise undefined.
 *   - `isEnum`: A boolean indicating if the schema is (or contains) a ZodEnum.
 */
export function checkZodEnum(fieldSchema: z.ZodTypeAny) {
  if (fieldSchema instanceof z.ZodEnum) return { enumOptions: fieldSchema.options as string[], isEnum: true }
  // below could be an optional z.ZodEnum
  // @ts-expect-error zod type issue
  const enumOptions = fieldSchema.def?.innerType?.options as string[]
  return { enumOptions, isEnum: Array.isArray(enumOptions) }
}

/**
 * Checks if a given Zod schema represents a boolean type, including boolean literals and optional booleans.
 * @param fieldSchema - The Zod schema to check.
 * @returns An object containing:
 *   - `isBoolean`: `true` if the schema is a boolean or boolean literal (including optional booleans), otherwise `false`.
 *   - `isBooleanLiteral`: `true` if the schema is a boolean literal (`true` or `false`), otherwise `false`.
 *   - `booleanLiteralValue`: The value of the boolean literal if applicable, otherwise `false`.
 */
export function checkZodBoolean(fieldSchema: z.ZodTypeAny) {
  let isBoolean = false
  let isBooleanLiteral = false
  let booleanLiteralValue = false
  if (fieldSchema instanceof z.ZodBoolean) isBoolean = true
  // below could be a z.ZodLiteral containing true/false
  if (fieldSchema instanceof z.ZodLiteral && (fieldSchema.value === true || fieldSchema.value === false)) {
    isBooleanLiteral = true
    isBoolean = true
    booleanLiteralValue = fieldSchema.value
  }
  // below could be an optional z.ZodBoolean
  // @ts-expect-error zod type issue
  if (fieldSchema._def?.innerType instanceof z.ZodBoolean) isBoolean = true
  return { booleanLiteralValue, isBoolean, isBooleanLiteral }
}

/**
 * Returns a string representation of a value based on its Zod schema type
 * @param fieldSchema the Zod schema describing the field type
 * @param value the value to be represented as a string
 * @returns a human-readable string representation of the value
 */
export function readonlyValue(fieldSchema: z.ZodTypeAny, value: unknown): string {
  const { isBoolean, isBooleanLiteral, booleanLiteralValue } = checkZodBoolean(fieldSchema)
  if (isBooleanLiteral) return booleanLiteralValue ? 'Yes' : 'No'
  if (isBoolean) return value ? 'Yes' : 'No'
  if (value === undefined || value === '') return '—'
  return String(value)
}

/**
 * Determines whether a form field should be visible based on its schema metadata and the current form data.
 * @param fieldSchema the Zod schema for the field, which may contain metadata describing dependencies.
 * @param formData the current form data as a record of field names to values.
 * @returns `true` if the field should be visible; `false` otherwise.
 */
export function isFieldVisible(fieldSchema: z.ZodTypeAny, formData: Record<string, unknown>): boolean {
  const metadata = typeof fieldSchema?.meta === 'function' ? (fieldSchema.meta() as AutoFormFieldMetadata) : undefined
  if (metadata?.dependsOn && !formData[metadata.dependsOn]) return false
  return true
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
 * Cleans the submitted form data by filtering out fields that are not visible or are marked as excluded in the schema metadata.
 * @param schema - The Zod schema object describing the form fields.
 * @param data - The submitted data object to be cleaned.
 * @param formData - The current form data, used to determine field visibility.
 * @returns A new object containing only the fields that are visible and not excluded according to the schema.
 */
export function cleanSubmittedData(schema: z.ZodObject, data: Record<string, unknown>, formData: Record<string, unknown>): Record<string, unknown> {
  const shape = schema.shape
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    const fieldSchema = shape[key] as z.ZodTypeAny
    const metadata = typeof fieldSchema?.meta === 'function' ? fieldSchema.meta() : undefined
    if (!isFieldVisible(fieldSchema, formData)) continue
    if (metadata?.excluded) continue
    result[key] = value
  }
  return result
}
