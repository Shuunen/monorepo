import { describe, expect, it } from 'vitest'
import { isOlderThan } from './date.utils.ts'

describe('Date utils', () => {
  it('isOlderThan A', () => {
    const date = new Date('2023-10-01')
    const days = 30
    const result = isOlderThan(date, days)
    expect(result).toBe(true)
  })
})
