import { nbMsInMinute } from './constants.js'

/**
 * Convert a date into iso string
 *
 * Example with timezone
 * in  : dateToIsoString(new Date())
 * out : "2018-09-03T15:24:00.366Z"
 *
 * Example without timezone
 * in  : dateToIsoString(new Date(), true)
 * out : "2018-09-03T15:24:00.366"
 * @param date input date
 * @param shouldRemoveTimezone remove the last z ?
 * @returns string like : "2018-09-03T15:24:00.366Z"
 */
export function dateToIsoString(date: Readonly<Date>, shouldRemoveTimezone = false) {
  let dateString = new Date(date.getTime() - date.getTimezoneOffset() * nbMsInMinute).toISOString()
  if (shouldRemoveTimezone && dateString.toLowerCase().endsWith('z')) dateString = dateString.slice(0, Math.max(0, dateString.length - 1))
  return dateString
}

/**
 * Format a date to ISO without time
 * @param date input date
 * @returns string like : "2019-12-31"
 */
export function dateIso10(date: Readonly<Date> = new Date()) {
  return String(date.toISOString().split('T')[0])
}

/**
 * Format a date to a specific format
 * @param date input date
 * @param format the format to use like : "yyyy-MM-dd" or "dd/MM/yyyy HH:mm:ss"
 * @param locale the locale to use, default is en-US
 * @returns a string like : "2018-09-03"
 */
export function formatDate(date: Readonly<Date>, format: string, locale = 'en-US') {
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: cant be simplified ^^
  return format.replaceAll(/y{4}|yy|M{4}|MM|dd|d|e{4}|e{3}|HH|mm|ss|\s/gu, match => {
    if (match === 'yyyy') return date.toLocaleDateString(locale, { year: 'numeric' })
    if (match === 'yy') return date.toLocaleDateString(locale, { year: '2-digit' })
    if (match === 'MMMM') return date.toLocaleDateString(locale, { month: 'long' })
    if (match === 'MM') return date.toLocaleDateString(locale, { month: '2-digit' })
    if (match === 'dd') return date.toLocaleDateString(locale, { day: '2-digit' })
    if (match === 'd') return date.toLocaleDateString(locale, { day: 'numeric' })
    if (match === 'eeee') return date.toLocaleDateString(locale, { weekday: 'long' })
    if (match === 'eee') return date.toLocaleDateString(locale, { weekday: 'short' })
    if (match === 'HH') return date.getHours().toString().padStart(match.length, '0')
    if (match === 'mm') return date.getMinutes().toString().padStart(match.length, '0')
    if (match === 'ss') return date.getSeconds().toString().padStart(match.length, '0')
    return match
  })
}
