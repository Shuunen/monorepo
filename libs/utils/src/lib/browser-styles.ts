import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines multiple classes into a single string
 * @param classes - The classes to combine
 * @returns The combined classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
