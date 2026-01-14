/**
 * Check if an object is empty (has no own properties)
 * @param obj the object to check
 * @returns true if the object is empty
 */
export function isEmpty(obj: Record<string, unknown>) {
  return Object.keys(obj).length === 0;
}
