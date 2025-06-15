import { parseJson } from './json.js'

function get(key: string, defaultValue: string): string
function get(key: string, defaultValue: boolean): boolean // eslint-disable-line @typescript-eslint/naming-convention
function get(key: string, defaultValue: number): number
function get<Type = unknown>(key: string, defaultValue: Type): Type // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
function get<Type = unknown>(key: string): Type | undefined

/**
 * Get a value from the storage media
 * @param key The key of the value to get
 * @param defaultValue The default value to return if the key is not found
 * @returns The value or defaultValue if not found
 */
function get<Type = unknown>(key: string, defaultValue?: Type) {
  const path = storage.prefix + key
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const data = storage.media[path] // don't use getItem because it's not supported by all browsers or in memory object storage
  if (data === undefined || data === null || data === '') return defaultValue
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const result = parseJson<Type>(data)
  // eslint-disable-next-line no-warning-comments, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-type-assertion
  if (!result.ok) return data as Type // TODO: wait... what ?!
  return result.value
}

/**
 * Set a value in the storage
 * @param key The key of the value to set
 * @param data The value to set
 * @returns The given value
 */
function set<Type>(key: string, data: Type) {
  const path = storage.prefix + key
  const value = typeof data === 'string' ? data : JSON.stringify(data)
  Reflect.set(storage.media, path, value)
  return data
}

/**
 * Check if storage has a value
 * @param key The key of the value to check
 * @returns true if storage has a value for the given key
 */
function has(key: string) {
  return get(key) !== undefined
}

/**
 * Remove a value from the storage
 * @param key The key of the value to remove
 */
function clear(key: string) {
  const path = storage.prefix + key
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete storage.media[path]
}

export const storage = {
  clear,
  get,
  has,
  /* c8 ignore next 2 */
  // oxlint-disable-next-line no-undef
  media: typeof localStorage === 'undefined' ? ({} as Storage) : localStorage,
  prefix: '', // prefix all keys in the storage with a custom string
  set,
}

export type ShuutilsStorage = typeof storage
