import { objectSerialize } from './object-serializer.js'

/**
 * Converts various data types to their string representation.
 * @param data the data to stringify
 * @param willIndent if true, the output object will be indented for better readability
 * @returns the string representation of the data
 */
export function stringify(data: unknown, willIndent = false) {
  if (data === undefined) return 'undefined'
  if (data === null) return 'null'
  if (typeof data === 'string') return data
  if (typeof data === 'object') return objectSerialize(data as Readonly<Record<string, unknown>>, false, willIndent)
  return String(data)
}
