import { safeParse } from 'valibot'
import { itemSchema } from './parsers.utils'

it('safeParse A empty object', () => {
  const result = safeParse(itemSchema, {})
  expect(result.issues?.map(issue => issue.message)).toMatchInlineSnapshot(`
    [
      "Invalid key: Expected "$createdAt" but received undefined",
      "Invalid key: Expected "$id" but received undefined",
      "Invalid key: Expected "name" but received undefined",
      "Invalid key: Expected "price" but received undefined",
      "Invalid key: Expected "reference" but received undefined",
      "Invalid key: Expected "status" but received undefined",
    ]
  `)
})
