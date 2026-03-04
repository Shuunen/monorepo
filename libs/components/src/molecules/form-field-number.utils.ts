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
 * @param schema the unwrapped Zod number schema to extract min/max from
 * @returns an object with min and max values, each undefined if not set
 */
export function getZodNumberMinMax(schema: z.ZodNumber): { min: number | undefined; max: number | undefined } {
  return {
    max:
      schema.maxValue !== undefined && schema.maxValue !== null && Number.isFinite(schema.maxValue)
        ? schema.maxValue
        : undefined,
    min:
      schema.minValue !== undefined && schema.minValue !== null && Number.isFinite(schema.minValue)
        ? schema.minValue
        : undefined,
  };
}
