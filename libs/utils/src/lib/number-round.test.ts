import { round } from './number-round.js'

it('round A', () => {
  expect(round(1.2345, 2)).toBe(1.23)
})
it('round B', () => {
  expect(round(1.2355, 2)).toBe(1.24)
})
it('round C', () => {
  expect(round(1.2355, 0)).toBe(1)
})
it('round D', () => {
  expect(round(1.2355, 1)).toBe(1.2)
})
it('round E', () => {
  expect(round(1.2355, 3)).toBe(1.236)
})
it('round F', () => {
  expect(round(1.2355)).toBe(1.24)
})
