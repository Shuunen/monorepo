import { nbMsInDay, nbMsInHour, nbMsInMinute, nbMsInSecond, nbMsInYear } from './constants.js'
import { daysAgo, daysAgoIso10, readableTimeAgo } from './date-relative.js'
import { dateIso10, dateToIsoString, formatDate, readableTime } from './dates.js'

const today = new Date()

it('dateIso10 specific date', () => {
  expect(dateIso10(new Date('2018-11-30'))).toBe('2018-11-30')
})
it('dateIso10 today', () => {
  expect(dateIso10(today)).toBe(today.toISOString().split('T')[0] ?? '')
})

// use dateIso10 to remove milliseconds that would differ from two new Date() instances
it('daysAgo give today by default', () => {
  expect(dateIso10()).toBe(dateIso10(daysAgo()))
})

it('daysAgoIso10 give today by default', () => {
  expect(daysAgoIso10()).toBe(dateIso10(today))
})

it('iso string date has length', () => {
  expect(dateToIsoString(new Date()).length > 0).toBe(true)
})
it('iso string date contains timezone by default', () => {
  expect(dateToIsoString(new Date()).toLowerCase().includes('z')).toBe(true)
})
it('iso string date does not contains timezone if needed', () => {
  expect(dateToIsoString(new Date(), true).toLowerCase().includes('z')).toBe(false)
})

const samples = [
  [1000, '1 second ago'],
  [2500, '2 seconds ago'],
  [0, 'now'],
  [daysAgo(), 'now'],
  [10 * 1000, '10 seconds ago'],
  [59 * 1000, '59 seconds ago'],
  [60 * 1000, '1 minute ago'],
  [61 * 1000, '1 minute ago'],
  [119 * 1000, '1 minute ago'],
  [120 * 1000, '2 minutes ago'],
  [121 * 1000, '2 minutes ago'],
  [60 ** 2 * 1000 - 1000, '59 minutes ago'],
  [1 * 60 * 60 * 1000, '1 hour ago'],
  [1.5 * 60 * 60 * 1000, '1 hour ago'],
  [2.5 * 60 * 60 * 1000, '2 hours ago'],
  [daysAgo(1), 'yesterday'],
  [daysAgo(2), '2 days ago'],
  [daysAgo(8), 'last week'],
  [daysAgo(15), '2 weeks ago'],
  [daysAgo(29), '4 weeks ago'],
  [daysAgo(35), 'last month'],
  [daysAgo(61), '2 months ago'],
  [daysAgo(364), '12 months ago'],
  [daysAgo(365), 'last year'],
] as const

for (const [index, [input, expected]] of samples.entries())
  it(`should calculate time ago correctly (index ${index})`, () => {
    expect(readableTimeAgo(input)).toBe(expected)
  })

const date = new Date('2021-09-02T07:08:28')
it('format date as (space) HH:mm:ss', () => {
  expect(formatDate(date, ' HH:mm:ss')).toBe(' 07:08:28')
})
it('format date as d', () => {
  expect(formatDate(date, 'd')).toBe('2')
})
it('format date as dd', () => {
  expect(formatDate(date, 'dd')).toBe('02')
})
it('format date as dd/MM/yyyy HH:mm:ss', () => {
  expect(formatDate(date, 'dd/MM/yyyy HH:mm:ss')).toBe('02/09/2021 07:08:28')
})
it('format date as dd/MM/yyyy', () => {
  expect(formatDate(date, 'dd/MM/yyyy')).toBe('02/09/2021')
})
it('format date as eee d', () => {
  expect(formatDate(date, 'eee d')).toBe('Thu 2')
})
it('format date as eee', () => {
  expect(formatDate(date, 'eee')).toBe('Thu')
})
it('format date as eeee', () => {
  expect(formatDate(date, 'eeee')).toBe('Thursday')
})
it('format date as HH', () => {
  expect(formatDate(date, 'HH')).toBe('07')
})
it('format date as mm', () => {
  expect(formatDate(date, 'mm')).toBe('08')
})
it('format date as MM', () => {
  expect(formatDate(date, 'MM')).toBe('09')
})
it('format date as MMMM', () => {
  expect(formatDate(date, 'MMMM')).toBe('September')
})
it('format date as ss', () => {
  expect(formatDate(date, 'ss')).toBe('28')
})
it('format date as yy-MM-dd', () => {
  expect(formatDate(date, 'yy-MM-dd')).toBe('21-09-02')
})
it('format date as yy', () => {
  expect(formatDate(date, 'yy')).toBe('21')
})
it('format date as yyyy (space)', () => {
  expect(formatDate(date, 'yyyy ')).toBe('2021 ')
})
it('format date as yyyy', () => {
  expect(formatDate(date, 'yyyy')).toBe('2021')
})

it('readable time A', () => {
  expect(readableTime(0)).toBe('0 millisecond')
})
it('readable time B', () => {
  expect(readableTime(nbMsInSecond)).toBe('1 second')
})
it('readable time C', () => {
  expect(readableTime(3 * nbMsInSecond)).toBe('3 seconds')
})
it('readable time D', () => {
  expect(readableTime(nbMsInMinute)).toBe('1 minute')
})
it('readable time E', () => {
  expect(readableTime(2 * nbMsInMinute)).toBe('2 minutes')
})
it('readable time F', () => {
  expect(readableTime(nbMsInHour)).toBe('1 hour')
})
it('readable time G', () => {
  expect(readableTime(3 * nbMsInDay, false)).toBe('3d')
})
it('readable time H', () => {
  expect(readableTime(nbMsInDay)).toBe('1 day')
})
it('readable time I', () => {
  expect(readableTime(42, false)).toBe('42ms')
})
it('readable time J', () => {
  expect(readableTime(42)).toBe('42 milliseconds')
})
it('readable time K', () => {
  expect(readableTime(2 * nbMsInHour)).toBe('2 hours')
})
it('readable time L', () => {
  expect(readableTime(3 * nbMsInDay)).toBe('3 days')
})
it('readable time M', () => {
  expect(readableTime(32 * nbMsInDay)).toBe('1 month')
})
it('readable time N', () => {
  expect(readableTime(2 * nbMsInYear)).toBe('2 years')
})
it('readable time O', () => {
  expect(readableTime(daysAgo(2))).toBe('2 days')
})
it('readable time P', () => {
  expect(readableTime(daysAgo(4), false)).toBe('4d')
})
