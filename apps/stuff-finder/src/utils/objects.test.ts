import { sortListsEntries } from './objects.utils'

it('sortListsEntries A', () => {
  expect(sortListsEntries({ key: ['c', 'a', 'b'] })).toEqual({ key: ['', 'a', 'b', 'c'] })
})

it('sortListsEntries B', () => {
  expect(sortListsEntries({ key: ['c', 'a', 'b'], key2: ['c', 'a', 'b'] })).toEqual({ key: ['', 'a', 'b', 'c'], key2: ['', 'a', 'b', 'c'] })
})

it('sortListsEntries C', () => {
  expect(sortListsEntries({})).toEqual({})
})

it('sortListsEntries D', () => {
  expect(sortListsEntries({ empty: [] })).toEqual({ empty: [''] })
})
