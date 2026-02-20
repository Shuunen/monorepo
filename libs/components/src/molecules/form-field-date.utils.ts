import { dateIso10, daysAgo } from "@monorepo/utils";
import { endOfDay, startOfDay } from "date-fns";
import { z } from "zod";

export const today = new Date(dateIso10());

export const yesterday = new Date(dateIso10(daysAgo(1)));

export const tomorrow = new Date(dateIso10(daysAgo(-1)));

export const dateTodayOrPastSchema = z
  .date("Mandatory field is missing.")
  .max(endOfDay(today), { message: "Date cannot be in the future." });

export const dateTodayOrFutureSchema = z
  .date("Mandatory field is missing.")
  .min(startOfDay(today), { message: "Date cannot be in the past." });

export const datePastSchema = z
  .date("Mandatory field is missing.")
  .max(endOfDay(yesterday), { message: "Date cannot be in the future." });

export const dateFutureSchema = z
  .date("Mandatory field is missing.")
  .min(startOfDay(tomorrow), { message: "Date cannot be in the past." });

const timeOnlyRegex = /^\d{2}:\d{2}$/;

/**
 * Normalizes a value to a Date object.
 * @param value - The value to normalize. Can be a Date instance, a string (ISO date or HH:MM time), or any other value.
 * @returns A Date object if the value is a valid date, otherwise undefined.
 */
export function normalizeToDate(value: unknown): Date | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "string") {
    if (timeOnlyRegex.test(value)) {
      const [hours, minutes] = value.split(":").map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    }
    return new Date(value);
  }
  if (typeof value === "number") {
    return new Date(value);
  }
  return undefined;
}

/**
 * Utility function to determine the initial value for a date field based on its Zod schema.
 * It checks if the schema has a default value defined, and if so, returns it. The default value can be either a Date object or a relative date string ("today", "yesterday", "tomorrow").
 * If the default value is a relative date string, it converts it to an actual Date object using the `getRelativeDate` function.
 * If no default value is defined in the schema, it returns an empty string.
 * @param fieldSchema - The Zod schema for the date field, which may include a default value.
 * @returns The initial value for the date field, which can be a Date object or an empty string if no default is defined.
 */
export function getInitialValue(fieldSchema: z.ZodType) {
  const date = (fieldSchema as z.ZodDefault).def.defaultValue;
  if (date instanceof Date) {
    return date;
  }
  return undefined;
}
