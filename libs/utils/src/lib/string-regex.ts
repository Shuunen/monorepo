export const htmlTagRegex = /<[^>]+>/u; // NOSONAR

export const base64Regex = /^(?:data:)?[\w/]+;base64,[\w+/=]+$/u;

export const base64TypeRegex = /[^:]\w+\/[\w+.-]+(?=;|,)/u; // NOSONAR

/**
 * Check if the string contains HTML
 * @param string the string to check
 * @returns true if the string contains HTML
 */
export function isHtml(string: string) {
  return htmlTagRegex.test(string);
}
