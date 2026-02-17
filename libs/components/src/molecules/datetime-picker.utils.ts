// oxlint-disable no-magic-numbers
import { isValidDate } from "@monorepo/utils";

const dateInputRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;

/**
 * Parse a DD/MM/YYYY string into a Date, returning undefined if the format or date is invalid
 * @param value - the date string in DD/MM/YYYY format
 * @returns the parsed Date or undefined if invalid
 */
export function parseInput(value: string): Date | undefined {
  const match = dateInputRegex.exec(value);
  if (!match) {
    return undefined;
  }
  const [, dd, mm, yyyy] = match;
  const date = new Date(`${yyyy}-${mm}-${dd}`);
  return isValidDate(date) ? date : undefined;
}

const timeInputRegex = /^(\d{2}):(\d{2})$/;

/**
 * Parse an HH:MM string into hours and minutes, returning undefined if the format or values are invalid
 * @param value - the time string in HH:MM format
 * @returns the parsed hours and minutes or undefined if invalid
 */
export function parseTimeInput(value: string): { hours: number; minutes: number } | undefined {
  const match = timeInputRegex.exec(value);
  if (!match) {
    return undefined;
  }
  const [, hh, mm] = match;
  const hours = Number.parseInt(hh, 10);
  const minutes = Number.parseInt(mm, 10);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return undefined;
  }
  return { hours, minutes };
}

/**
 * Formats a Date object into a time string in HH:MM format.
 * @param date - The Date object to format
 * @returns A string representing the time in HH:MM format (e.g., "14:30")
 */
export function formatTime(date: Date) {
  const timeLength = 2;
  const hours = String(date.getHours()).padStart(timeLength, "0");
  const minutes = String(date.getMinutes()).padStart(timeLength, "0");
  return `${hours}:${minutes}`;
}

/**
 * Compute the resulting Date when the date input changes, combining parsed date with time if applicable
 * @param options - the date change context
 * @returns the computed Date or undefined
 */
export function computeDateChangeValue(options: {
  noonHour: number;
  parsedDate: Date | undefined;
  time: boolean;
  timeValue: string;
}) {
  if (options.time) {
    const parsedTime = parseTimeInput(options.timeValue);
    if (options.parsedDate && parsedTime) {
      const newDate = new Date(options.parsedDate);
      newDate.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);
      return newDate;
    }
    return undefined;
  }
  if (options.parsedDate) {
    const newDate = new Date(options.parsedDate);
    newDate.setUTCHours(options.noonHour, 0, 0, 0);
    return newDate;
  }
  return undefined;
}

/**
 * Compute the resulting Date when the time input changes, using the existing date when in date-time mode
 * @param maskedValue - the masked time input value
 * @param date - the currently selected date
 * @param showDate - whether the date input is visible
 * @returns the computed Date or undefined
 */
export function computeTimeChangeValue(maskedValue: string, date: Date | undefined, showDate: boolean) {
  const parsedTime = parseTimeInput(maskedValue);
  if (!showDate) {
    if (parsedTime) {
      const newDate = new Date();
      newDate.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);
      return newDate;
    }
    return undefined;
  }
  if (date && parsedTime) {
    const newDate = new Date(date);
    newDate.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);
    return newDate;
  }
  return undefined;
}

/**
 * Convert a calendar-picked local date to a UTC Date, optionally applying the time value
 * @param options - the calendar date conversion context
 * @returns the UTC Date or undefined
 */
export function calendarDateToUtc(options: { calendarDate: Date | undefined; time: boolean; timeValue: string }) {
  const newDate = options.calendarDate
    ? new Date(
        Date.UTC(
          options.calendarDate.getFullYear(),
          options.calendarDate.getMonth(),
          options.calendarDate.getDate(),
          0,
          0,
          0,
          0,
        ),
      )
    : undefined;
  if (options.time && newDate) {
    const timeData = parseTimeInput(options.timeValue);
    if (timeData) {
      newDate.setUTCHours(timeData.hours);
      newDate.setUTCMinutes(timeData.minutes);
    }
  }
  return newDate;
}

const digitRegex = /[0-9]/;

/**
 * Check whether a keyboard event key is a single digit character (0-9)
 * @param key - the keyboard event key value
 * @returns true if the key is a digit
 */
export function isDigitKey(key: string): boolean {
  return key.length === 1 && digitRegex.test(key);
}

const dateInputMaxLength = 10;

/**
 * Check whether the cursor is at the end of a fully completed date input (10 characters)
 * @param selectionStart - the cursor position in the input
 * @param valueLength - the current input value length
 * @returns true if the cursor is at the end of a complete date input
 */
export function isDateInputAtEnd(selectionStart: number | null, valueLength: number): boolean {
  return selectionStart === valueLength && valueLength === dateInputMaxLength;
}

/**
 * Determine whether the clear button should be visible based on current date and time input values
 * @param dateValue - the current date input string
 * @param timeValue - the current time input string
 * @returns true if the clear button should be shown
 */
export function shouldShowClearButton(dateValue: string, timeValue: string): boolean {
  return dateValue !== "" || (timeValue !== "" && timeValue !== "--:--");
}
