import { expectEqualTypes, expectType } from './expect-type.js'

type Person = {
  age: number
  name: string
}

it('expectType A valid', () => {
  expect(expectType<number>(12)).toBeTruthy()
})

it('expectType B invalid', () => {
  // @ts-expect-error invalid type here
  expect(expectType<number>('12')).toBeTruthy()
})

it('expectType C complex', () => {
  expect(expectType<Person>({ age: 42, name: 'John' })).toBeTruthy()
})

it('expectType D complex invalid', () => {
  // @ts-expect-error invalid type here
  expect(expectType<Person>({ age: '42', name: 'John' })).toBeTruthy()
})

it('expectEqualTypes A inferred valid', () => {
  expect(expectEqualTypes(12, 34)).toBeTruthy()
})

it('expectEqualTypes B inferred invalid', () => {
  // @ts-expect-error invalid type here
  expect(expectEqualTypes(12, '12')).toBeTruthy()
})

it('expectEqualTypes C inferred complex valid', () => {
  expect(expectEqualTypes({ age: 42, name: 'John' }, { age: 6, name: 'Johnny' })).toBeTruthy()
})

it('expectEqualTypes D inferred complex invalid', () => {
  // @ts-expect-error invalid type here
  expect(expectEqualTypes({ age: 42, name: 'John' }, { age: '66', name: 'Johnny' })).toBeTruthy()
})

it('expectEqualTypes E specified valid', () => {
  expect(expectEqualTypes<number, number>(12, 35)).toBeTruthy()
})

it('expectEqualTypes F specified invalid', () => {
  // @ts-expect-error invalid type here
  expect(expectEqualTypes<number, number>(12, '41')).toBeTruthy()
})

it('expectEqualTypes G specified complex valid', () => {
  expect(expectEqualTypes<Person, Person>({ age: 42, name: 'John' }, { age: 31, name: 'Johnny' })).toBeTruthy()
})

it('expectEqualTypes H specified complex invalid', () => {
  // @ts-expect-error invalid type here
  expect(expectEqualTypes<Person, Person>({ age: 42, name: 'John' }, { age: '31', name: 'Johnny' })).toBeTruthy()
})

it('expectEqualTypes I specified type mismatch', () => {
  // @ts-expect-error invalid type here
  expect(expectEqualTypes<Person, string>({ age: 42, name: 'John' }, 'Johnny')).toBeTruthy()
})
