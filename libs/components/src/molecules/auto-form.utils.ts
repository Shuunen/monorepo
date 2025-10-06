import { z } from 'zod'

export function checkZodEnum(fieldSchema: z.ZodTypeAny) {
  if (fieldSchema instanceof z.ZodEnum) return { enumOptions: fieldSchema.options as string[], isEnum: true }
  // below could be an optional z.ZodEnum
  // @ts-expect-error zod type issue
  const enumOptions = fieldSchema.def?.innerType?.options as string[]
  return { enumOptions, isEnum: Array.isArray(enumOptions) }
}

export function checkZodBoolean(fieldSchema: z.ZodTypeAny) {
  let isBoolean = false
  let isBooleanLiteral = false
  let booleanLiteralValue = false
  if (fieldSchema instanceof z.ZodBoolean) isBoolean = true
  // below could be a z.ZodLiteral containing true/false
  if (fieldSchema instanceof z.ZodLiteral && (fieldSchema.value === true || fieldSchema.value === false)) {
    isBooleanLiteral = true
    isBoolean = true
    booleanLiteralValue = fieldSchema.value
  }
  // below could be an optional z.ZodBoolean
  // @ts-expect-error zod type issue
  if (fieldSchema._def?.innerType instanceof z.ZodBoolean) isBoolean = true
  return { booleanLiteralValue, isBoolean, isBooleanLiteral }
}

export function readonlyValue(fieldSchema: z.ZodTypeAny, value: unknown): string {
  const { isBoolean, isBooleanLiteral, booleanLiteralValue } = checkZodBoolean(fieldSchema)
  // console.log('readonlyValue', { booleanLiteralValue, isBoolean, isBooleanLiteral, value })
  if (isBooleanLiteral) return booleanLiteralValue ? 'Yes' : 'No'
  if (isBoolean) return value ? 'Yes' : 'No'
  return String(value) || '—'
}
