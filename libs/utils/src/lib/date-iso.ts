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

const INVALID_DATE = "N/A";
const EMPTY_DATE = "-";

/**
 * Strip the seconds, milliseconds and timezone from an ISO date string
 * @param date  the ISO date as a string or a Date object
 * @param options - {
 *   withTime?: boolean; // Whether to include the time (hours:minutes) in the output. Defaults to `true`.
 *   acceptPartialDate?: boolean; // Whether to accept partial dates like "2025" or "2025-12". Defaults to `false`. If true and the date is partial, the output is handled by `partialDateDisplay`.
 * }
 * @returns A formatted date string (example: "24/12/2025" or "24/12/2025 17:00"), or a special INVALID_DATE constant if the input is invalid and partials are not accepted. If partials are accepted, returns a formatted partial date string.
 */
export function dateIsoToReadableDatetime(
  date: string | Date | null | undefined,
  options: {
    withTime?: boolean;
    acceptPartialDate?: boolean;
  } = {},
): string {
  const withTime = options.withTime ?? true;
  const acceptPartialDate = options.acceptPartialDate ?? false;
  if (!date) {
    return EMPTY_DATE;
  }

  const dateObject: Date = date instanceof Date ? date : new Date(date);
  const padLength = 2;

  const invalidDate = Number.isNaN(dateObject.getTime());

  if (invalidDate && !acceptPartialDate) {
    return INVALID_DATE;
  }

  if (invalidDate && acceptPartialDate) {
    return partialDateDisplay(date as string);
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

const DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Converts a partial ISO date string to a human-readable format.
 *
 * Recognizes the following partial date formats:
 * - "YYYY-00-00": returns "YYYY"
 * - "YYYY-MM-00": returns "MM/YYYY"
 * For any other format (including full dates or invalid formats), returns "-".
 *
 * @param dateString - The ISO date string in the format "YYYY-MM-DD".
 * @returns A human-readable string for partial dates, or "-" if the format is not recognized.
 */
function partialDateDisplay(dateString: string): string {
  const match = DATE_REGEX.exec(dateString);
  if (!match) {
    return INVALID_DATE;
  }
  const year = match[1];
  // oxlint-disable-next-line no-magic-numbers
  const month = match[2];
  // oxlint-disable-next-line no-magic-numbers
  const day = match[3];

  if (year === "0000") {
    return INVALID_DATE;
  }

  if (month === "00") {
    return `${year}`;
  }
  if (month !== "00" && day === "00") {
    return `${month}/${year}`;
  }
  return INVALID_DATE;
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
