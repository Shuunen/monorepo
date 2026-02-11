/**
 * Aligns an array to a target length by filling or truncating as needed.
 * @param values - The array to align. If undefined, creates a new array.
 * @param targetLength - The desired length of the output array. If undefined, returns a single-element array with undefined.
 * @param initialValue - The value to fill the array with. If undefined, uses undefined.
 * @returns An array aligned to the target length
 * @example arrayAlign([1, 2], 4) // [1, 2, undefined, undefined]
 */
export function arrayAlign<Type = unknown>(values?: Type[], targetLength?: number, initialValue?: unknown): Type[] {
  if (values === undefined && targetLength !== undefined) {
    return Array.from({ length: targetLength }).fill(initialValue) as Type[];
  }
  if (values !== undefined && targetLength !== undefined && values.length !== targetLength) {
    return Array.from({ length: targetLength }).map((_value, index) => values[index] || initialValue) as Type[];
  }
  if (values) {
    return values;
  }
  return [initialValue] as Type[];
}
