/**
 * Check if a value is an object/record
 * @param value the value to check
 * @returns true if value is an object/record
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
