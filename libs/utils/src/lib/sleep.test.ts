import { sleep } from './sleep.js'

it('sleep A', async () => {
  expect(await sleep(5)).toBe(5)
})
it('sleep B', async () => {
  expect(await sleep(7)).toBe(7)
})
