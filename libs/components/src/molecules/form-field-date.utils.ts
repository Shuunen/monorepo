import type { AutoFormFieldMetadata } from "./auto-form.types";
import { field } from "./auto-form.utils";
import { dateIso10, daysAgo, formatDate } from "@monorepo/utils";
import { z } from "zod";

type DateRelative = "today" | "yesterday" | "tomorrow";

type DateOrRelative = DateRelative | Date;

type FieldDateProps = AutoFormFieldMetadata & {
  initialValue?: DateOrRelative;
  minDate?: DateOrRelative;
  maxDate?: DateOrRelative;
};

/**
 * Utility function to convert a relative date string ("today", "yesterday", "tomorrow") to an actual Date object.
 * @param date - The relative date string to convert.
 * @returns A Date object representing the specified relative date.
 * @throws An error if the input string is not a recognized relative date.
 */
function getRelativeDate(date: DateRelative): Date {
  if (date === "today") {
    return new Date(dateIso10());
  } else if (date === "yesterday") {
    return new Date(dateIso10(daysAgo(1)));
  } else if (date === "tomorrow") {
    return new Date(dateIso10(daysAgo(-1)));
  }
  throw new Error(`Un-handled relative date : ${date}`);
}

/**
 * Utility function to create a Zod schema for a date field with optional minimum and maximum date constraints.
 * @param schema - The initial Zod schema for a date field.
 * @param minDate - An optional minimum date constraint, which can be a specific Date object or the string "today" to represent the current date.
 * @returns A Zod schema with the minimum date constraint applied if provided.
 */
function addMin(schema: z.ZodDate, minDate?: FieldDateProps["minDate"]) {
  if (!minDate) {
    return schema;
  }
  const isDate = minDate instanceof Date;
  const dateToCompare = isDate ? minDate : getRelativeDate(minDate);
  const message = `Date must be on or after ${isDate ? formatDate(dateToCompare, "yyyy-MM-dd") : minDate}`;
  return schema.min(dateToCompare, message);
}

/**
 * Utility function to create a Zod schema for a date field with optional maximum date constraints.
 * @param schema - The initial Zod schema for a date field.
 * @param maxDate - An optional maximum date constraint, which can be a specific Date object or the string "today" to represent the current date.
 * @returns A Zod schema with the maximum date constraint applied if provided.
 */
function addMax(schema: z.ZodDate, maxDate?: FieldDateProps["maxDate"]) {
  if (!maxDate) {
    return schema;
  }
  const isDate = maxDate instanceof Date;
  const dateToCompare = isDate ? maxDate : getRelativeDate(maxDate);
  const message = `Date must be on or before ${isDate ? formatDate(dateToCompare, "yyyy-MM-dd") : maxDate}`;
  return schema.max(dateToCompare, message);
}

/**
 * Creates a Zod schema for a date field with optional minimum and maximum date constraints.
 * @param fieldMetadata - The metadata for the date field, including optional minDate and maxDate.
 * @returns A Zod schema for the date field with the specified constraints, equivalent to `field(z.date().min(minDate).max(maxDate), ...)`
 */
export function fieldDate(fieldMetadata: FieldDateProps) {
  const { initialValue, minDate, maxDate, ...rest } = fieldMetadata;
  const schema = addMin(addMax(z.date(), maxDate), minDate);
  if (initialValue === undefined) {
    return field(schema, rest);
  }
  const initialDate = initialValue instanceof Date ? initialValue : getRelativeDate(initialValue);
  return field(schema.prefault(initialDate), rest);
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
  if (typeof date === "string") {
    return getRelativeDate(date as DateRelative);
  }
  return undefined;
}
