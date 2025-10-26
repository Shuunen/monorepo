import { z } from 'zod'
import { checkZodBoolean, cleanSubmittedData, filterSchema, getZodEnumOptions, isFieldVisible, isZodBoolean, isZodEnum, isZodFile, isZodNumber } from './auto-form.utils'
import { imageSchemaOptional, imageSchemaRequired } from './form-field-upload.const'

describe('auto-form.utils', () => {
  // isZodEnum
  it('isZodEnum A should detect ZodEnum', () => {
    const schema = z.enum(['foo', 'bar'])
    expect(isZodEnum(schema)).toBe(true)
  })
  it('isZodEnum B should detect optional ZodEnum', () => {
    const schema = z.enum(['foo', 'bar']).optional()
    expect(isZodEnum(schema)).toBe(true)
  })
  it('isZodEnum C should return false for non-enum', () => {
    const schema = z.string()
    expect(isZodEnum(schema)).toBe(false)
  })
  // getZodEnumOptions
  it('getZodEnumOptions A should detect ZodEnum and return options', () => {
    const schema = z.enum(['foo', 'bar'])
    const result = getZodEnumOptions(schema)
    if (!result.ok) throw new Error('Expected success but got error')
    expect(result.value).toEqual(['foo', 'bar'])
  })
  it('getZodEnumOptions B should also works with optional ZodEnum', () => {
    const schema = z.enum(['foo', 'bar']).optional()
    const result = getZodEnumOptions(schema)
    if (!result.ok) throw new Error('Expected success but got error')
    expect(result.value).toEqual(['foo', 'bar'])
  })
  it('getZodEnumOptions C should return error for non-enum', () => {
    const schema = z.string()
    const result = getZodEnumOptions(schema)
    expect(result.ok).toBe(false)
  })
  // isZodBoolean
  it('isZodBoolean A should detect ZodBoolean', () => {
    const schema = z.boolean()
    expect(isZodBoolean(schema)).toBe(true)
  })
  it('isZodBoolean B should detect optional ZodBoolean', () => {
    const schema = z.boolean().optional()
    expect(isZodBoolean(schema)).toBe(true)
  })
  it('isZodBoolean C should return false for non-boolean', () => {
    const schema = z.string()
    expect(isZodBoolean(schema)).toBe(false)
  })
  it('isZodBoolean D should handle ZodLiteral true', () => {
    const schema = z.literal(true)
    expect(isZodBoolean(schema)).toBe(true)
  })
  it('isZodBoolean E should handle ZodLiteral false', () => {
    const schema = z.literal(false)
    expect(isZodBoolean(schema)).toBe(true)
  })
  it('isZodBoolean D should handle ZodLiteral non-boolean', () => {
    const schema = z.literal('foo')
    expect(isZodBoolean(schema)).toBe(false)
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
  // checkZodNumber
  it('checkZodNumber A should detect ZodNumber', () => {
    const schema = z.number()
    expect(isZodNumber(schema)).toBe(true)
  })
  it('checkZodNumber B should detect optional ZodNumber', () => {
    const schema = z.number().optional()
    expect(isZodNumber(schema)).toBe(true)
  })
  it('checkZodNumber C should return false for non-number', () => {
    const schema = z.string()
    expect(isZodNumber(schema)).toBe(false)
  })

  // checkZodFile
  it('checkZodFile A should detect ZodFile', () => {
    const schema = z.file()
    expect(isZodFile(schema)).toBe(true)
  })
  it('checkZodFile B should detect optional ZodFile', () => {
    const schema = z.file().optional()
    expect(isZodFile(schema)).toBe(true)
  })
  it('checkZodFile C should detect ZodEffects wrapping ZodFile', () => {
    const schema = imageSchemaRequired
    expect(isZodFile(schema)).toBe(true)
  })
  it('checkZodFile D should detect optional ZodEffects wrapping ZodFile', () => {
    const schema = imageSchemaOptional
    expect(isZodFile(schema)).toBe(true)
  })
  it('checkZodFile E should return false for non-file', () => {
    const schema = z.string()
    expect(isZodFile(schema)).toBe(false)
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
