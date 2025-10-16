import { base64Regex, base64TypeRegex } from './string-regex.js'

/**
 * Check if the string is a base64 string
 * @param string the string to check
 * @returns true if the string is a base64 string
 */

export function isBase64(string: string) {
  return base64Regex.test(string)
}
/**
 * Parse a base64 string
 * @param string the base64 string to parse
 * @returns the parsed string like `{ base64: 'iVBORw0KGgoYII=', size: 11, type: 'image/png' }`
 */

export function parseBase64(string: string) {
  const result = { base64: '', size: 0, type: '' }
  if (!isBase64(string)) return result
  const type = base64TypeRegex.exec(string)
  if (type && typeof type[0] === 'string') [result.type] = type
  const base64 = string.split('base64,')
  if (base64.length > 1 && typeof base64[1] === 'string') [, result.base64] = base64
  // oxlint-disable-next-line no-magic-numbers
  result.size = Math.round((result.base64.length * 3) / 4)
  return result
}
