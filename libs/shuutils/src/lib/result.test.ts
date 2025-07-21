import { Result } from './result.js'

it('Result.ok', () => {
  expect(Result.ok(42)).toMatchInlineSnapshot(`
    Ok {
      "ok": true,
      "value": 42,
    }
  `)
})

it('Result.error', () => {
  expect(Result.error('ay ay ay caramba !')).toMatchInlineSnapshot(`
    Err {
      "error": "ay ay ay caramba !",
      "ok": false,
    }
  `)
})

it('Result.trySafe A ok', () => {
  const result = Result.trySafe(() => JSON.parse('{"a": 42}'))
  expect(result).toMatchInlineSnapshot(`
    Ok {
      "ok": true,
      "value": {
        "a": 42,
      },
    }
  `)
})

it('Result.trySafe B error', () => {
  const result = Result.trySafe(() => JSON.parse('{"a": 42'))
  expect(result.ok).toBe(false)
  if (!result.ok) expect(String(result.error)).toContain('SyntaxError')
})

it('Result.trySafe C promise ok', async () => {
  const result = await Result.trySafe(Promise.resolve(42))
  expect(result).toMatchInlineSnapshot(`
    Ok {
      "ok": true,
      "value": 42,
    }
  `)
})

it('Result.unwrap A ok', () => {
  const result = Result.trySafe(() => ({ ahh: 42 }))
  const { error, value } = Result.unwrap(result)
  expect(value?.ahh).toMatchInlineSnapshot(`42`)
  expect(error).toMatchInlineSnapshot(`undefined`)
})

it('Result.unwrap B error', () => {
  const result = Result.trySafe(() => JSON.parse('{"a": 42'))
  const { error, value } = Result.unwrap(result)
  expect(value).toMatchInlineSnapshot(`undefined`)
  expect(String(error)).toContain('SyntaxError')
})
