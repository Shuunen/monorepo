import { safeAssign } from './object-safe-assign.js'

it('object assign A simple', () => {
  expect(Object.assign({ name: 'John' }, { name: 'Claire' })).toStrictEqual({ name: 'Claire' })
})

it('object assign B limitation, overwrite with undefined', () => {
  expect(Object.assign({ age: 31, name: 'John' }, { age: undefined, name: 'Claire' })).toMatchInlineSnapshot(`
    {
      "age": undefined,
      "name": "Claire",
    }
  `)
})

it('object assign C limitation, overwrite with null', () => {
  expect(Object.assign({ age: 31, name: 'John' }, { age: null, name: 'Claire' })).toMatchInlineSnapshot(`
    {
      "age": null,
      "name": "Claire",
    }
  `)
})

it('object assign D limitation, loose side data', () => {
  expect(Object.assign({ details: { age: 42, type: 'years' }, name: 'John' }, { details: { age: 21 }, name: 'Claire' })).toMatchInlineSnapshot(`
    {
      "details": {
        "age": 21,
      },
      "name": "Claire",
    }
  `)
})

it('safe assign A simple', () => {
  expect(safeAssign({ name: 'John' }, { name: 'Claire' })).toStrictEqual({ name: 'Claire' })
})

it('safe assign B does not overwrite with undefined', () => {
  expect(safeAssign({ age: 31, name: 'John' }, { age: undefined, name: 'Claire' })).toStrictEqual({ age: 31, name: 'Claire' })
})

it('safe assign C does not overwrite with null', () => {
  expect(safeAssign({ age: 31, name: 'John' }, { age: null, name: 'Claire' })).toStrictEqual({ age: 31, name: 'Claire' })
})

it('safe assign D does not loose side data', () => {
  expect(safeAssign({ details: { age: 42, type: 'years' }, name: 'John' }, { details: { age: 21 }, name: 'Claire' })).toStrictEqual({
    details: { age: 21, type: 'years' },
    name: 'Claire',
  })
})

it('safe assign E 2nd param undefined', () => {
  expect(safeAssign({ name: 'John' })).toStrictEqual({ name: 'John' })
})

it('safe assign F 2nd param empty object', () => {
  expect(safeAssign({ name: 'John' }, {})).toStrictEqual({ name: 'John' })
})

it('safe assign G 2nd param overwrite', () => {
  expect(safeAssign({ name: 'John' }, { name: 'Claire' })).toStrictEqual({ name: 'Claire' })
})

it('safe assign H does overwrite with empty string', () => {
  expect(safeAssign({ age: 31, name: 'John' }, { name: '' })).toStrictEqual({ age: 31, name: '' })
})

it('safe assign I does not overwrite with empty object', () => {
  expect(safeAssign({ details: { age: 42, type: 'years' }, name: 'John' }, { details: {}, name: '' })).toStrictEqual({ details: { age: 42, type: 'years' }, name: '' })
})

it('safe assign J does handle non existing sub object', () => {
  expect(safeAssign({ name: 'John' }, { details: { age: 42, type: 'years' } })).toStrictEqual({ details: { age: 42, type: 'years' }, name: 'John' })
})
