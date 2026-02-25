import type { z } from "zod";

/**
 * Ensure the value is a string
 * @param value the value that need to be transform
 * @returns a string of the value
 */

export function toLocalValue(value: unknown) {
  return value === undefined || value === null ? "" : String(value);
}

/**
 * Extracts min and max values from a Zod number schema.
 * @param fieldSchema the Zod number schema to extract min/max from
 * @returns an object with min and max values, each undefined if not set
 */
export function getZodNumberMinMax(fieldSchema: z.ZodNumber): { min: number | undefined; max: number | undefined } {
  return {
    max:
      fieldSchema.maxValue !== undefined && fieldSchema.maxValue !== null && Number.isFinite(fieldSchema.maxValue)
        ? (fieldSchema.maxValue as number)
        : undefined,
    min:
      fieldSchema.minValue !== undefined && fieldSchema.minValue !== null && Number.isFinite(fieldSchema.minValue)
        ? (fieldSchema.minValue as number)
        : undefined,
  };
}
