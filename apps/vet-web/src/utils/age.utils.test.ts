/** biome-ignore-all lint/style/useNamingConvention: it'ok here */
import { describe, expect, it } from 'vitest'
import { ageSchema, ages } from './age.utils'

describe('Ages Schema Tests', () => {
  describe('Valid cases', () => {
    it('should validate all valid age combinations for both schemas', () => {
      for (const age of ages) {
        const validInput = { Code: age.Code, Version: age.Version }
        const schemaResult = ageSchema.safeParse(validInput)
        expect(schemaResult.success).toBe(true)
      }
    })
  })

  describe('Invalid cases', () => {
    const invalidCases = [
      { Code: '0001', Version: '03' }, // Wrong version for male
      { Code: '0002', Version: '01' }, // Wrong version for female
      { Code: '0003', Version: '12' }, // Wrong version for unspecified
      { Code: '9999', Version: '07' }, // Wrong version for not applicable
      { Code: '1234', Version: '01' }, // Invalid code
      { Code: '0001', Version: '99' }, // Invalid version
      { Code: '', Version: '01' }, // Empty code
      { Code: '0001', Version: '' }, // Empty version
    ]

    it('should reject invalid age combinations for both schemas', () => {
      for (const invalidInput of invalidCases) {
        const schemaResult = ageSchema.safeParse(invalidInput)
        expect(schemaResult.success).toBe(false)
      }
    })
  })
})
