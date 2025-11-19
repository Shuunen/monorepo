import type { ZodError } from 'zod'

/**
 * Format a zod error to be short and readable in a snapshot
 * @param error the zod error to format
 * @returns the formatted error
 */
export function zodSnap(error?: ZodError) {
  return error?.issues.map(issue => `${issue.path.join('.')} | ${issue.code} | ${issue.message}`)
}
