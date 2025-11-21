import { describe, expect, it } from 'vitest'
import { testIdFromProps } from './form.utils'

describe('form.utils', () => {
  it('testIdFromProps A with empty name', () => {
    expect(() => testIdFromProps('prefix', { name: '' })).toThrowError('name cannot be empty string when deriving testId from name')
  })
  it('testIdFromProps B with name', () => {
    expect(testIdFromProps('prefix', { name: 'myFieldName' })).toBe('prefix-my-field-name')
  })
  it('testIdFromProps C throws error when prefix is empty string and name is used', () => {
    expect(() => testIdFromProps('', { name: 'myFieldName' })).toThrowError('prefix cannot be empty string when deriving testId from name')
  })
  it('testIdFromProps D throws error when name is empty string', () => {
    expect(() => testIdFromProps('prefix', { name: '' })).toThrowError('name cannot be empty string when deriving testId from name')
  })
  it('testIdFromProps E with addValue true', () => {
    // @ts-expect-error type issue
    expect(testIdFromProps('prefix', { name: 'myFieldName', value: 'someValue' }, true)).toBe('prefix-my-field-name-some-value')
  })
})
