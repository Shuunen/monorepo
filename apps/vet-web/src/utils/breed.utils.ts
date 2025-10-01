import type { Option } from './form.types.ts'
import { optionToSchema } from './form.utils'

export const breeds = [
  { label: 'Cat / Feline', value: 'cat' },
  { label: 'Dog / Canine', value: 'dog' },
] as const satisfies Option[]

export const breedSchema = optionToSchema(breeds)
