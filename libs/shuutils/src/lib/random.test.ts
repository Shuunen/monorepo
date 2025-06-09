import { randomBoolean, randomEmail, randomNumber, randomPerson, randomString } from './random.js'

it('randomString A', () => {
  expect(randomString().length > 0).toBe(true)
})

it('randomBoolean A', () => {
  expect(typeof randomBoolean()).toBe('boolean')
})

it('randomEmail A', () => {
  const email = randomEmail('Mickael', 'Scott')
  expect(email.includes('.scott')).toBe(true)
})

it('randomPerson A', () => {
  const person = randomPerson()
  expect(person.email.includes('.')).toBe(true)
})

it('randomNumber 0 min by default', () => {
  expect(randomNumber() >= 0).toBe(true)
})
it('randomNumber 100 max by default', () => {
  expect(randomNumber() <= 100).toBe(true)
})
it('randomNumber between 22 & 122', () => {
  expect(randomNumber(22, 122) <= 122).toBe(true)
})
it('randomNumber between 42 & 42', () => {
  expect(randomNumber(42, 42)).toBe(42)
})
