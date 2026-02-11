/**
 * Aligns an array to a target length by filling or truncating as needed.
 * @param values - The array to align. If undefined, creates a new array.
 * @param targetLength - The desired length of the output array. If undefined, returns a single-element array with undefined.
 * @param fillValue - The value to fill the array with. If undefined, uses undefined.
 * @returns An array aligned to the target length
 * @example arrayAlign([1, 2], 4) // [1, 2, undefined, undefined]
 */
export function arrayAlign<Type = unknown>(values?: Type[], targetLength?: number, fillValue?: Type): Type[] {
  if (values === undefined && targetLength !== undefined) {
    return Array.from<Type>({ length: targetLength }).fill(fillValue as Type);
  }
  if (values !== undefined && targetLength !== undefined && values.length !== targetLength) {
    return Array.from<Type>({ length: targetLength }).map((_value, index) => values[index] || (fillValue as Type));
  }
  if (values) {
    return values;
  }
  return [fillValue as Type];
}
