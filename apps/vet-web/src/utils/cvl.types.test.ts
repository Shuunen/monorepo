/** biome-ignore-all lint/style/useNamingConvention: it'ok here */
import { describe, expectTypeOf, it } from 'vitest'
import type { CodeVersion, CodeVersionLabel } from './cvl.types.ts'

describe('cvl.types', () => {
  it('should define CodeVersionLabel type correctly', () => {
    expectTypeOf<CodeVersionLabel>().toEqualTypeOf<{
      readonly Code: string
      readonly Version: string
      readonly label: string
    }>()
  })

  it('should define CodeVersion type as CodeVersionLabel without label', () => {
    expectTypeOf<CodeVersion>().toEqualTypeOf<{
      readonly Code: string
      readonly Version: string
    }>()
  })

  it('should allow creating valid CodeVersionLabel objects', () => {
    const cvl: CodeVersionLabel = {
      Code: 'TEST',
      label: 'Test Label',
      Version: '01',
    }
    expectTypeOf(cvl).toMatchTypeOf<CodeVersionLabel>()
  })

  it('should allow creating valid CodeVersion objects', () => {
    const cv: CodeVersion = {
      Code: 'TEST',
      Version: '01',
    }
    expectTypeOf(cv).toMatchTypeOf<CodeVersion>()
  })
})
