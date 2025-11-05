import { stringify } from './string-stringify.js'

describe('string-stringify', () => {
  const samples = [
    { _: 'A', in: null, out: 'null' },
    { _: 'B', in: 'hello', out: 'hello' },
    { _: 'C', in: 42, out: '42' },
    { _: 'D', in: { a: 1, b: 'text' }, out: '{"a":1,"b":"text"}' },
    { _: 'E', in: undefined, out: 'undefined' },
    { _: 'F', in: true, out: 'true' },
  ]
  for (const sample of samples)
    it(`stringify ${sample._}`, () => {
      expect(stringify(sample.in)).toBe(sample.out)
    })

  it('stringify with indentation', () => {
    const obj = { a: 1, b: { c: 'text', d: [1, 2, 3] } }
    expect(stringify(obj, true)).toMatchInlineSnapshot(`
      "{
        "a": 1,
        "b": {
          "c": "text",
          "d": [
            1,
            2,
            3
          ]
        }
      }"
    `)
  })
})
