import { z } from 'zod'
import { checkZodBoolean, checkZodEnum, cleanSubmittedData, filterSchema, isFieldVisible, readonlyValue } from './auto-form.utils'

describe('auto-form.utils', () => {
  // checkZodEnum
  it('checkZodEnum A should detect ZodEnum and return options', () => {
    const schema = z.enum(['foo', 'bar'])
    const { enumOptions, isEnum } = checkZodEnum(schema)
    expect(enumOptions).toEqual(['foo', 'bar'])
    expect(isEnum).toBe(true)
  })
  it('checkZodEnum B should detect optional ZodEnum', () => {
    const schema = z.enum(['foo', 'bar']).optional()
    const { enumOptions, isEnum } = checkZodEnum(schema)
    expect(enumOptions).toEqual(['foo', 'bar'])
    expect(isEnum).toBe(true)
  })

  // checkZodBoolean
  it('checkZodBoolean A should detect ZodBoolean', () => {
    const schema = z.boolean()
    const { isBoolean, booleanLiteralValue, isBooleanLiteral } = checkZodBoolean(schema)
    expect(isBoolean).toBe(true)
    expect(booleanLiteralValue).toBe(false)
    expect(isBooleanLiteral).toBe(false)
  })
  it('checkZodBoolean B should detect ZodLiteral true', () => {
    const schema = z.literal(true)
    const { isBoolean, booleanLiteralValue, isBooleanLiteral } = checkZodBoolean(schema)
    expect(isBoolean).toBe(true)
    expect(booleanLiteralValue).toBe(true)
    expect(isBooleanLiteral).toBe(true)
  })
  it('checkZodBoolean C should detect ZodLiteral false', () => {
    const schema = z.literal(false)
    const { isBoolean, booleanLiteralValue, isBooleanLiteral } = checkZodBoolean(schema)
    expect(isBoolean).toBe(true)
    expect(booleanLiteralValue).toBe(false)
    expect(isBooleanLiteral).toBe(true)
  })
  it('checkZodBoolean D should detect optional ZodBoolean', () => {
    const schema = z.boolean().optional()
    const { isBoolean } = checkZodBoolean(schema)
    expect(isBoolean).toBe(true)
  })

  // readonlyValue
  it('readonlyValue A should return Yes/No for boolean', () => {
    const schema = z.boolean()
    expect(readonlyValue(schema, true)).toBe('Yes')
    expect(readonlyValue(schema, false)).toBe('No')
  })
  it('readonlyValue B should return Yes/No for literal', () => {
    const schema = z.literal(true)
    expect(readonlyValue(schema, true)).toBe('Yes')
    expect(readonlyValue(schema, false)).toBe('Yes') // because isBooleanLiteral is true and booleanLiteralValue is true
  })
  it('readonlyValue C should return string for other', () => {
    const schema = z.string()
    expect(readonlyValue(schema, 'foo')).toBe('foo')
    expect(readonlyValue(schema, '')).toBe('—')
    expect(readonlyValue(schema, undefined)).toBe('—')
  })
  it('readonlyValue D should handle undefined and empty string for boolean', () => {
    const schema = z.boolean()
    expect(readonlyValue(schema, undefined)).toBe('No')
    expect(readonlyValue(schema, '')).toBe('No')
  })
  it('readonlyValue E should handle literal false', () => {
    const schema = z.literal(false)
    expect(readonlyValue(schema, false)).toBe('No')
  })

  // isFieldVisible
  it('isFieldVisible A should return true if no dependsOn', () => {
    const schema = z.string().meta({ label: 'A' })
    expect(isFieldVisible(schema, {})).toBe(true)
  })
  it('isFieldVisible B should return false if dependsOn is not set in data', () => {
    const schema = z.string().meta({ dependsOn: 'foo', label: 'A' })
    expect(isFieldVisible(schema, {})).toBe(false)
  })
  it('isFieldVisible C should return true if dependsOn is set in data', () => {
    const schema = z.string().meta({ dependsOn: 'foo', label: 'A' })
    expect(isFieldVisible(schema, { foo: 1 })).toBe(true)
  })
  it('isFieldVisible D should handle missing meta function', () => {
    const schema = z.string()
    expect(isFieldVisible(schema, {})).toBe(true)
  })
  it('isFieldVisible E should handle meta returning undefined', () => {
    const schema = z.string()
    expect(isFieldVisible(schema, {})).toBe(true)
  })

  // filterSchema
  it('filterSchema A should filter out fields not visible', () => {
    const shape = {
      a: z.string().meta({ label: 'A' }),
      b: z.string().meta({ dependsOn: 'a', label: 'B' }),
    }
    const schema = z.object(shape)
    const filtered = filterSchema(schema, { a: 'something' })
    expect(filtered.shape).toHaveProperty('a')
    expect(filtered.shape).toHaveProperty('b')
    const filtered2 = filterSchema(schema, {})
    expect(filtered2.shape).toHaveProperty('a')
    expect(filtered2.shape).not.toHaveProperty('b')
  })

  // cleanSubmittedData
  it('cleanSubmittedData A should remove excluded fields and invisible fields', () => {
    const shape = {
      a: z.string().meta({ label: 'A' }),
      b: z.string().meta({ excluded: true, label: 'B' }),
      c: z.string().meta({ dependsOn: 'a', label: 'C' }),
    }
    const schema = z.object(shape)
    const data = { a: 'foo', b: 'bar', c: 'baz' }
    const cleaned = cleanSubmittedData(schema, data, { a: 'foo' })
    expect(cleaned).toMatchInlineSnapshot(`
      {
        "a": "foo",
        "c": "baz",
      }
    `)
    const cleaned2 = cleanSubmittedData(schema, data, {})
    expect(cleaned2).toMatchInlineSnapshot(`
      {
        "a": "foo",
      }
    `)
  })
  it('cleanSubmittedData B should handle missing fieldSchema and metadata', () => {
    const schema = z.object({})
    const data = { x: 1 }
    expect(cleanSubmittedData(schema, data, {})).toEqual({ x: 1 })
  })
})
