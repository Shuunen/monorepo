import { camelToKebabCase, kebabToPascalCase } from './string-case.js'

describe('string-case', () => {
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

  it('camelToKebabCase A basic', () => {
    expect(camelToKebabCase('helloWorld')).toBe('hello-world')
  })
  it('camelToKebabCase B with multiple uppercase letters', () => {
    expect(camelToKebabCase('thisIsATestString')).toBe('this-is-a-test-string')
  })

  it('camelToKebabCase C with numbers', () => {
    expect(camelToKebabCase('hello123World')).toBe('hello123-world')
  })
  it('camelToKebabCase D with special characters', () => {
    expect(camelToKebabCase('hello_World Test')).toBe('hello-world-test')
  })
  it('camelToKebabCase E with single word', () => {
    expect(camelToKebabCase('hello')).toBe('hello')
  })
  it('camelToKebabCase F with empty string', () => {
    expect(camelToKebabCase('')).toBe('')
  })
})
