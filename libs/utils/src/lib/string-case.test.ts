import { kebabToPascalCase } from './string-case.js'

it('kebabToPascalCase A basic', () => {
  expect(kebabToPascalCase('hello-world')).toBe('HelloWorld')
})
it('kebabToPascalCase B with numbers', () => {
  expect(kebabToPascalCase('hello-123-world')).toBe('Hello123World')
})
it('kebabToPascalCase C with special characters', () => {
  expect(kebabToPascalCase('hello-_-world')).toBe('Hello_World')
})
it('kebabToPascalCase D with one single word', () => {
  expect(kebabToPascalCase('hello')).toBe('Hello')
})
it('kebabToPascalCase E with empty string', () => {
  expect(kebabToPascalCase('')).toBe('')
})
