import { expectEqualTypes } from './expect-type.js'
import { memoize } from './memoize.js'

let addCalls = 0

/**
 * Add two numbers
 * @param numberA the first number
 * @param numberB the second number
 * @returns the sum of the two numbers
 */
function add(numberA: number, numberB: number) {
  addCalls += 1
  return numberA + numberB
}

const memoizedAdd = memoize(add)

it('memoize A testing non memoized function', () => {
  addCalls = 0
  expect(addCalls).toBe(0)
  expect(add(1, 2)).toBe(3)
  expect(addCalls).toBe(1)
  expect(add(1, 2)).toBe(3)
  expect(addCalls).toBe(2)
})

it('memoize B testing memoized function', () => {
  addCalls = 0
  expect(addCalls).toBe(0)
  expect(memoizedAdd(1, 2)).toBe(3)
  expect(addCalls).toBe(1)
  expect(memoizedAdd(1, 2)).toBe(3)
  expect(addCalls).toBe(1)
  expect(memoizedAdd(2, 1)).toBe(3)
  expect(addCalls).toBe(2)
  expect(memoizedAdd(1, 2)).toBe(3)
  expect(addCalls).toBe(2)
  expect(memoizedAdd(2, 1)).toBe(3)
  expect(addCalls).toBe(2)
  expect(memoizedAdd(1.5, 1.5)).toBe(3)
  expect(addCalls).toBe(3)
})

it('memoize C invalid callback given', () => {
  expect(() => memoize(1 as unknown as () => void)).toThrowErrorMatchingInlineSnapshot(`[Error: memoize callback parameter should be a function]`)
})

type Parent = { age?: number; firstName: string; lastName: string }

let childNameCalls = 0

/**
 * Calculate the full name of a child
 * @param firstName the first name of the child
 * @param parentA the first parent
 * @param parentB the second parent
 * @returns the full name of the child
 */
function childName(firstName: string, parentA: Readonly<Parent>, parentB: Readonly<Parent>) {
  childNameCalls += 1
  return `${firstName} ${parentA.lastName} ${parentB.lastName}`
}

const memoizedChildName = memoize(childName)

it('memoize D testing memoized function with objects', () => {
  childNameCalls = 0
  expect(childNameCalls).toBe(0)
  const parentA = { age: 33, firstName: 'John', lastName: 'Doe' }
  const parentB = { firstName: 'Jane', lastName: 'Mac' }
  expect(memoizedChildName('Michael', parentA, parentB)).toBe('Michael Doe Mac')
  expect(childNameCalls).toBe(1)
  expect(memoizedChildName('Michael', parentA, parentB)).toBe('Michael Doe Mac')
  expect(childNameCalls).toBe(1)
  parentA.age = 34
  expect(memoizedChildName('Michael', parentA, parentB)).toBe('Michael Doe Mac')
  expect(childNameCalls).toBe(2)
})

it('memoize E : return types', () => {
  expectEqualTypes(add(1, 2), memoizedAdd(1, 2))
})
