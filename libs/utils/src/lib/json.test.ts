import { isJson, parseJson } from './json.js'
import { Result } from './result.js'

it('valid JSON', () => {
  expect(isJson('{ "name": "John Doe" }')).toBe(true)
})
it('invalid JSON', () => {
  expect(isJson('"name": "John Doe" }')).toBe(false)
})
it('un-parse-able JSON', () => {
  expect(isJson('{"name" "John Doe" }')).toBe(false)
})

it('parse json valid object string', () => {
  expect(parseJson('{ "name": "John Cena", "age": 42 }')).toMatchInlineSnapshot(`
    Ok {
      "ok": true,
      "value": {
        "age": 42,
        "name": "John Cena",
      },
    }
  `)
})
it('parse json invalid object string', () => {
  const { error } = Result.unwrap(parseJson('{ xyz "name": "John Cena" }'))
  expect(error).toContain('Invalid JSON string')
})
it('parse json valid array string', () => {
  expect(parseJson('[ "John Cena", 42 ]')).toMatchInlineSnapshot(`
    Ok {
      "ok": true,
      "value": [
        "John Cena",
        42,
      ],
    }
  `)
})
