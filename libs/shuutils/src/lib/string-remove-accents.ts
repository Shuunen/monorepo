/**
 * Remove accents from a string
 * @param string the string to remove accents from
 * @returns the string without accents
 * @example utils.removeAccents('éàù') // returns 'eau'
 */
export function removeAccents(string: string) {
  // biome-ignore lint/suspicious/noMisleadingCharacterClass: <explanation>
  return string.normalize('NFD').replace(/[\u0300-\u036F]/gu, '')
}
