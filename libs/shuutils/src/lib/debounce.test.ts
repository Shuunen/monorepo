import { debounce } from './debounce.js'
import { expectEqualTypes } from './expect-type.js'
import { sleep } from './functions.js'

let times = 0

/**
 * @returns the number of times the function has been called
 */
function myFunction() {
  times += 1
  return times
}

const myFunctionDebounced = debounce(myFunction, 10)

/**
 * @returns the number of times the function has been called after 50ms
 */
async function myAsyncFunction() {
  await sleep(5)
  times += 1
  return times
}

const myAsyncFunctionDebounced = debounce(myAsyncFunction, 10)

it('debounce A : sync function', async () => {
  times = 0
  expect(times).toBe(0)
  myFunctionDebounced()
  expect(times).toBe(0)
  await sleep(5)
  expect(times).toBe(0)
  await sleep(6)
  expect(times).toBe(1)
  await sleep(3)
  expect(times).toBe(1)
})

it('debounce B : async function', async () => {
  times = 0
  expect(times).toBe(0)
  myAsyncFunctionDebounced()
  expect(times).toBe(0)
  await sleep(5)
  expect(times).toBe(0)
  await sleep(5) // the delay inside the function is 50ms
  expect(times).toBe(0)
  await sleep(6)
  expect(times).toBe(1)
  await sleep(3)
  expect(times).toBe(1)
})

it('debounce C : return type', () => {
  expect(typeof myFunctionDebounced).toBe('function')
})

it('debounce D : return type sync', () => {
  expect(Object.prototype.toString.call(myFunctionDebounced)).toBe('[object AsyncFunction]')
})

it('debounce E : return type sync resolve', async () => {
  times = 42
  expect(await myFunctionDebounced()).toBe(43)
})

it('debounce F : return type async', () => {
  expect(Object.prototype.toString.call(myAsyncFunctionDebounced)).toBe('[object AsyncFunction]')
})

it('debounce G : return type async resolve', async () => {
  times = 42
  expect(await myAsyncFunctionDebounced()).toBe(43)
})

it('debounce H : return types', async () => {
  expectEqualTypes(await myAsyncFunction(), await myAsyncFunctionDebounced())
})
