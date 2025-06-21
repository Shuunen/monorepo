import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { asciiBottle, getBottles, pour } from './bottle.utils'
import type { Bottle } from './colors.utils'
import { logger } from './logger.utils'

describe('bottle tests', () => {
  beforeAll(() => {
    logger.disable()
  })

  afterAll(() => {
    logger.enable()
  })

  it('pour A', () => {
    const a: Bottle = ['', '', 'blue']
    const b: Bottle = ['', '', '']

    const [aUpdated, bUpdated] = pour(a, b)
    expect(aUpdated).toEqual(['', '', ''])
    expect(bUpdated).toEqual(['', '', 'blue'])
  })

  it('pour A bis', () => {
    const a: Bottle = ['red', 'yellow', 'blue']
    const b: Bottle = ['', '', '']

    const [aUpdated, bUpdated] = pour(a, b)
    expect(aUpdated).toEqual(['', 'yellow', 'blue'])
    expect(bUpdated).toEqual(['', '', 'red'])
  })

  it('pour B', () => {
    const a: Bottle = ['', '', '']
    const b: Bottle = ['', '', '']

    const [aUpdated, bUpdated] = pour(a, b)
    expect(aUpdated).toEqual(['', '', ''])
    expect(bUpdated).toEqual(['', '', ''])
  })

  it('pour C', () => {
    const a: Bottle = ['', '', '']
    const b: Bottle = ['', '', 'blue']

    const [aUpdated, bUpdated] = pour(a, b)
    expect(aUpdated).toEqual(['', '', ''])
    expect(bUpdated).toEqual(['', '', 'blue'])
  })

  it('pour D', () => {
    const a: Bottle = ['yellow', 'yellow', 'blue']
    const b: Bottle = ['', '', 'blue']

    const [aUpdated, bUpdated] = pour(a, b)
    expect(aUpdated).toEqual(['', '', 'blue'])
    expect(bUpdated).toEqual(['yellow', 'yellow', 'blue'])
  })

  it('pour E', () => {
    const a: Bottle = ['yellow', 'yellow', 'blue']
    const b: Bottle = ['', '', '']

    const [aUpdated, bUpdated] = pour(a, b)
    expect(aUpdated).toEqual(['', '', 'blue'])
    expect(bUpdated).toEqual(['', 'yellow', 'yellow'])
  })

  it('pour F', () => {
    const a: Bottle = ['yellow', 'yellow', 'blue']
    const b: Bottle = ['blue', 'blue', 'blue']

    const [aUpdated, bUpdated] = pour(a, b)
    expect(aUpdated).toEqual(['yellow', 'yellow', 'blue'])
    expect(bUpdated).toEqual(['blue', 'blue', 'blue'])
  })

  it('pour G', () => {
    const a: Bottle = ['yellow', 'yellow', 'blue']
    const b: Bottle = ['', 'yellow', 'blue']

    const [aUpdated, bUpdated] = pour(a, b)
    expect(aUpdated).toEqual(['', 'yellow', 'blue'])
    expect(bUpdated).toEqual(['yellow', 'yellow', 'blue'])
  })

  it('pour H pour one', () => {
    const a: Bottle = ['yellow', 'yellow', 'blue']
    const b: Bottle = ['', '', '']

    const [aUpdated, bUpdated] = pour(a, b, 1)
    expect(aUpdated).toEqual(['', 'yellow', 'blue'])
    expect(bUpdated).toEqual(['', '', 'yellow'])
  })

  it('pour I pour two', () => {
    const a: Bottle = ['red', 'yellow', 'blue', 'blue']
    const b: Bottle = ['', '', '', 'green']

    const [aUpdated, bUpdated] = pour(a, b, 2)
    expect(aUpdated).toEqual(['', 'yellow', 'blue', 'blue'])
    expect(bUpdated).toEqual(['', '', 'red', 'green'])
  })

  it('getBottles A', () => {
    const bottles = getBottles()
    expect(bottles.length).toBeGreaterThan(1)
  })

  it('asciiBottle A with common colors', () => {
    const bottle: Bottle = ['yellow', 'yellow', 'blue']
    const ascii = asciiBottle(bottle)
    expect(ascii).toMatchInlineSnapshot(`"<🟨|🟨|🟦]"`)
  })

  it('asciiBottle B with unhandled colors', () => {
    // @ts-expect-error testing unhandled colors
    const bottle: Bottle = ['yellow', 'purple', 'blue', 'green']
    const ascii = asciiBottle(bottle)
    expect(ascii).toMatchInlineSnapshot(`"<🟨|purple|🟦|🟩]"`)
  })
})
