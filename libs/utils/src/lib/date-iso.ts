import { nbMsInMinute } from "./constants.js";

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
  let dateString = new Date(date.getTime() - date.getTimezoneOffset() * nbMsInMinute).toISOString();
  if (shouldRemoveTimezone && dateString.toLowerCase().endsWith("z")) {
    dateString = dateString.slice(0, Math.max(0, dateString.length - 1));
  }
  return dateString;
}

/**
 * Format a date to ISO without time
 * @param date input date
 * @returns string like : "2019-12-31"
 */
export function dateIso10(date: Readonly<Date> = new Date()) {
  return String(date.toISOString().split("T")[0]);
}

/**
 * Strip the seconds, milliseconds and timezone from an ISO date string
 *
 * @param date  the ISO date string
 * @returns ex: `2025-06-26T12:34`
 */
export function dateIsoStripSecondsZone(date: string) {
  const dateObject = new Date(date);
  if (Number.isNaN(dateObject.getTime())) {
    return "";
  }
  // oxlint-disable-next-line no-magic-numbers
  return new Date(date).toISOString().slice(0, 16);
}

/**
 * Strip the seconds, milliseconds and timezone from an ISO date string
 * @param date  the ISO date as a string or a Date object
 * @param withTime  boolean that decide if it return the time or not
 * @returns ex: `24/12/2025`
 */
export function dateIsoToReadableDatetime(date: string | Date | null | undefined, withTime = true): string {
  if (!date) {
    return "-";
  }

  const dateObject: Date = date instanceof Date ? date : new Date(date);
  const padLength = 2;

  if (Number.isNaN(dateObject.getTime())) {
    return "-";
  }

  const day = String(dateObject.getUTCDate()).padStart(padLength, "0");
  const month = String(dateObject.getUTCMonth() + 1).padStart(padLength, "0");
  const year = dateObject.getUTCFullYear();

  let result = `${day}/${month}/${year}`;
  if (withTime) {
    const hours = String(dateObject.getUTCHours()).padStart(padLength, "0");
    const minutes = String(dateObject.getUTCMinutes()).padStart(padLength, "0");
    result += ` ${hours}:${minutes}`;
  }

  return result;
}

const millisecondsPattern = /\.\d{3}Z$/;

/**
 * Builds an ISO 8601 string based on local date and time parts.
 * This function takes date and time strings in local time,
 * constructs a Date object, and returns the ISO string in UTC.
 * @param datePart - The local date string in "YYYY-MM-DD" format (e.g., "2023-06-28")
 * @param timePart - The local time string in "HH:mm" format (e.g., "15:45")
 * @returns The corresponding ISO string (e.g., "2023-06-28T13:45:00Z"), or an empty string if date or time is missing
 */
export function buildIsoFromLocal(datePart: string, timePart: string): string {
  if (!datePart || !timePart) {
    return "";
  }
  const [yy, mm, dd] = datePart.split("-").map(Number);
  const [hh, min] = timePart.split(":").map(Number);

  const local = new Date(yy, mm - 1, dd, hh, min, 0, 0);

  if (Number.isNaN(local.getTime())) {
    return "";
  }
  return new Date(local.getTime() - local.getTimezoneOffset() * nbMsInMinute)
    .toISOString()
    .replace(millisecondsPattern, "Z");
}

/**
 * Check if the date is valid
 *
 * @param date  the date
 * @returns ex: `true`
 */
export function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !Number.isNaN(date.getTime());
}
