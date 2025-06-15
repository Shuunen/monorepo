/**
 * Combines multiple classes into a single string
 * @param classes - The classes to combine
 * @returns The combined classes
 */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
export function cn(...classes: (boolean | string | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
