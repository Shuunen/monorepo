/**
 * Combines multiple classes into a single string
 * @param classes - The classes to combine
 * @returns The combined classes
 */
export function cn(...classes: (boolean | string | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
