/**
 * Aligns an array to a target length by filling or truncating as needed.
 * @param values - The array to align. If undefined, creates a new array.
 * @param targetLength - The desired length of the output array. If undefined, returns a single-element array with undefined.
 * @returns An array aligned to the target length
 * @example arrayAlign([1, 2], 4) // [1, 2, undefined, undefined]
 */
export function arrayAlign(values?: unknown[], targetLength?: number) {
  if (values === undefined && targetLength !== undefined) {
    return Array.from({ length: targetLength }).fill(undefined);
  }
  if (values !== undefined && targetLength !== undefined && values.length !== targetLength) {
    return Array.from({ length: targetLength }).map((_value, index) => values[index]);
  }
  return values ?? [undefined];
}
