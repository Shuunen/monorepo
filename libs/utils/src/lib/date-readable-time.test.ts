import { nbMsInDay, nbMsInHour, nbMsInMinute, nbMsInSecond, nbMsInYear } from './constants.js'
import { readableTime } from './date-readable-time.js'

describe('date-readable-time', () => {
  it('readableTime A', () => {
    expect(readableTime(0)).toBe('0 millisecond')
  })
  it('readableTime B', () => {
    expect(readableTime(nbMsInSecond)).toBe('1 second')
  })
  it('readableTime C', () => {
    expect(readableTime(3 * nbMsInSecond)).toBe('3 seconds')
  })
  it('readableTime D', () => {
    expect(readableTime(nbMsInMinute)).toBe('1 minute')
  })
  it('readableTime E', () => {
    expect(readableTime(2 * nbMsInMinute)).toBe('2 minutes')
  })
  it('readableTime F', () => {
    expect(readableTime(nbMsInHour)).toBe('1 hour')
  })
  it('readableTime G', () => {
    expect(readableTime(3 * nbMsInDay, false)).toBe('3d')
  })
  it('readableTime H', () => {
    expect(readableTime(nbMsInDay)).toBe('1 day')
  })
  it('readableTime I', () => {
    expect(readableTime(42, false)).toBe('42ms')
  })
  it('readableTime J', () => {
    expect(readableTime(42)).toBe('42 milliseconds')
  })
  it('readableTime K', () => {
    expect(readableTime(2 * nbMsInHour)).toBe('2 hours')
  })
  it('readableTime L', () => {
    expect(readableTime(3 * nbMsInDay)).toBe('3 days')
  })
  it('readableTime M', () => {
    expect(readableTime(32 * nbMsInDay)).toBe('1 month')
  })
  it('readableTime N', () => {
    expect(readableTime(2 * nbMsInYear)).toBe('2 years')
  })
  it('readableTime O should handle exactly 1 year', () => {
    expect(readableTime(nbMsInYear)).toBe('1 year')
  })
  it('readableTime P should handle exactly 1 year short', () => {
    expect(readableTime(nbMsInYear, false)).toBe('1y')
  })
})
