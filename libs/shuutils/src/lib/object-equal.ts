import { objectSerialize } from './object-serializer.js'

/**
 * Check if two objects are deeply equal
 * @param objectA the base object to compare
 * @param objectB the object to compare with
 * @param willSortKeys if true, the order of keys will be sorted alpha before comparison
 * @returns true if the two objects are deeply equal
 */
export function objectEqual(objectA: Readonly<Record<string, unknown>>, objectB: Readonly<Record<string, unknown>>, willSortKeys = false) {
  return objectSerialize(objectA, willSortKeys) === objectSerialize(objectB, willSortKeys)
}
