import type { ZodError } from 'zod'

/**
 * Get the first message from a zod error
 * @param error the zod error to extract the message from
 * @deprecated use zodSnap instead because this function only returns the first issue
 * @returns the first message
 */
export function zodMsg(error?: ZodError) {
  return error?.issues[0].message
}

/**
 * Format a zod error to be short and readable in a snapshot
 * @param error the zod error to format
 * @returns the formatted error
 */
export function zodSnap(error?: ZodError) {
  return error?.issues.map(issue => `${issue.path.join('.')} | ${issue.code} | ${issue.message}`)
}
