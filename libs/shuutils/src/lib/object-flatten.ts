/**
 * Convert a multi-level deep object into a single-level, flatten, object
 * @param object like `{ person: { name: 'John Doe', age: 32 } }`
 * @param path optional, add a root path to all keys
 * @param separator optional, the character to join keys
 * @returns object like `{ 'person.name': 'John Doe', 'person.age': 32 }`
 */
export function flatten(object: Readonly<Record<string, unknown>>, path = '', separator = '.'): Record<string, unknown> {
  return Object.keys(object).reduce<Record<string, unknown>>((accumulator: Readonly<Record<string, unknown>>, key: string) => {
    const value = object[key]
    const updatedPath = Array.isArray(object) ? `${path}[${key}]` : [path, key].filter(Boolean).join(separator)
    const isObject = [typeof value === 'object', value !== null, !(value instanceof Date), !(value instanceof RegExp), !(Array.isArray(value) && value.length === 0)].every(Boolean)
    // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
    return isObject ? { ...accumulator, ...flatten(value as Record<string, unknown>, updatedPath, separator) } : { ...accumulator, [updatedPath]: value }
  }, {})
}
