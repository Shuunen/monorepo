import { z } from 'zod'

export function checkZodEnum(fieldSchema: z.ZodTypeAny) {
  if (fieldSchema instanceof z.ZodEnum) return { enumOptions: fieldSchema.options as string[], isEnum: true }
  // below could be an optional z.ZodEnum
  // @ts-expect-error zod type issue
  const enumOptions = fieldSchema.def?.innerType?.options as string[]
  return { enumOptions, isEnum: Array.isArray(enumOptions) }
}
