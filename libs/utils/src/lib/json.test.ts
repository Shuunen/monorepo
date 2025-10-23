import { isJson, parseJson } from './json.js'
import { Result } from './result.js'

describe('json utils', () => {
  it('isJson A valid JSON', () => {
    expect(isJson('{ "name": "John Doe" }')).toBe(true)
  })
  it('isJson B invalid JSON', () => {
    expect(isJson('"name": "John Doe" }')).toBe(false)
  })
  it('isJson C un-parse-able JSON', () => {
    expect(isJson('{"name" "John Doe" }')).toBe(false)
  })

  it('parseJson A valid object string', () => {
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
  it('parseJson B invalid object string', () => {
    const { error } = Result.unwrap(parseJson('{ xyz "name": "John Cena" }'))
    expect(error).toContain('Invalid JSON string')
  })
  it('parseJson C valid array string', () => {
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

  it('parseJson D error should include error message', () => {
    const result = parseJson('invalid json {]')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('Invalid JSON string')
  })
})
