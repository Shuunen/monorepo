import { describe, expect, it } from 'vitest'
import { dateFromPath } from './check-souvenirs.cli'

describe('check-souvenirs.cli', () => {
  const tests = [
    {
      description: 'A regular case with year and month',
      expected: { month: '08', year: '2006' },
      input: 'D:\\Souvenirs\\2006\\2006-08_House Foobar\\P1000068.jpg',
    },
    {
      description: 'B regular case with only year',
      expected: { month: undefined, year: '2006' },
      input: 'D:\\Souvenirs\\2006\\Me puissance 10.jpg',
    },
    {
      description: 'C regular case with 00 month',
      expected: { month: undefined, year: '2006' },
      input: 'D:\\Souvenirs\\2006\\2006-00_Term Mont-topaz-photo-lighting-face-upscale-2x.jpeg',
    },
    {
      description: 'D irregular case with no year or month',
      expected: { month: undefined, year: undefined },
      input: 'D:\\Souvenirs\\Miscellaneous\\random-file.png',
    },
  ]

  for (const test of tests)
    it(`dateFromPath ${test.description}`, () => {
      const result = dateFromPath(test.input)
      if (!result.ok) throw new Error('Expected ok result')
      expect(result.value).toStrictEqual(test.expected)
    })
})
