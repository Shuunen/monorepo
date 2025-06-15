import { isJson, parseJson } from './json.js'

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
  expect(parseJson('{ xyz "name": "John Cena" }')).toMatchInlineSnapshot(`
    Err {
      "error": "Invalid JSON string: Expected property name or '}' in JSON at position 2 (line 1 column 3)",
      "ok": false,
    }
  `)
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
