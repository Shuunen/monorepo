import { describe, expect, it } from "vitest";
import {
  calendarDateToUtc,
  computeDateChangeValue,
  computeTimeChangeValue,
  formatTime,
  isDateInputAtEnd,
  isDigitKey,
  parseInput,
  parseTimeInput,
  shouldShowClearButton,
} from "./datetime-picker.utils";

describe("datetime-picker.utils", () => {
  // parseInput
  it("parseInput A should parse a valid DD/MM/YYYY date", () => {
    const result = parseInput("15/06/2025");
    expect(result).toBeInstanceOf(Date);
    expect(result?.toISOString()).toMatchInlineSnapshot(`"2025-06-15T00:00:00.000Z"`);
  });

  it("parseInput B should return undefined for incomplete input", () => {
    expect(parseInput("15/06")).toMatchInlineSnapshot(`undefined`);
  });

  it("parseInput C should return undefined for empty string", () => {
    expect(parseInput("")).toMatchInlineSnapshot(`undefined`);
  });

  it("parseInput D should return undefined for non-matching format", () => {
    expect(parseInput("2025-06-15")).toMatchInlineSnapshot(`undefined`);
  });

  it("parseInput E should return undefined for non-date string", () => {
    expect(parseInput("hello")).toMatchInlineSnapshot(`undefined`);
  });

  it("parseInput F should parse leap year date", () => {
    const result = parseInput("29/02/2024");
    expect(result?.toISOString()).toMatchInlineSnapshot(`"2024-02-29T00:00:00.000Z"`);
  });

  it("parseInput G should return undefined for regex-matching but invalid date like month 13", () => {
    expect(parseInput("15/13/2025")).toMatchInlineSnapshot(`undefined`);
  });

  // parseTimeInput
  it("parseTimeInput A should parse valid time 09:30", () => {
    expect(parseTimeInput("09:30")).toMatchInlineSnapshot(`
      {
        "hours": 9,
        "minutes": 30,
      }
    `);
  });

  it("parseTimeInput B should parse midnight 00:00", () => {
    expect(parseTimeInput("00:00")).toMatchInlineSnapshot(`
      {
        "hours": 0,
        "minutes": 0,
      }
    `);
  });

  it("parseTimeInput C should parse 23:59", () => {
    expect(parseTimeInput("23:59")).toMatchInlineSnapshot(`
      {
        "hours": 23,
        "minutes": 59,
      }
    `);
  });

  it("parseTimeInput D should return undefined for invalid hours 25:00", () => {
    expect(parseTimeInput("25:00")).toMatchInlineSnapshot(`undefined`);
  });

  it("parseTimeInput E should return undefined for invalid minutes 12:60", () => {
    expect(parseTimeInput("12:60")).toMatchInlineSnapshot(`undefined`);
  });

  it("parseTimeInput F should return undefined for empty string", () => {
    expect(parseTimeInput("")).toMatchInlineSnapshot(`undefined`);
  });

  it("parseTimeInput G should return undefined for placeholder --:--", () => {
    expect(parseTimeInput("--:--")).toMatchInlineSnapshot(`undefined`);
  });

  it("parseTimeInput H should return undefined for incomplete time 12:", () => {
    expect(parseTimeInput("12:")).toMatchInlineSnapshot(`undefined`);
  });

  // formatTime
  it("formatTime A should format midnight", () => {
    expect(formatTime(new Date("2025-01-01T00:00:00"))).toMatchInlineSnapshot(`"00:00"`);
  });

  it("formatTime B should format with padding", () => {
    expect(formatTime(new Date("2025-01-01T09:05:00"))).toMatchInlineSnapshot(`"09:05"`);
  });

  it("formatTime C should format afternoon time", () => {
    expect(formatTime(new Date("2025-01-01T14:30:00"))).toMatchInlineSnapshot(`"14:30"`);
  });

  // computeDateChangeValue
  it("computeDateChangeValue A should return date with time when time mode and valid time", () => {
    const parsedDate = new Date("2025-06-15");
    const result = computeDateChangeValue({ parsedDate, timeValue: "14:30", time: true, noonHour: 0 });
    expect(result).toBeInstanceOf(Date);
    expect(result?.getHours()).toBe(14);
    expect(result?.getMinutes()).toBe(30);
  });

  it("computeDateChangeValue B should return undefined when time mode and invalid time", () => {
    const parsedDate = new Date("2025-06-15");
    expect(computeDateChangeValue({ parsedDate, timeValue: "", time: true, noonHour: 0 })).toMatchInlineSnapshot(
      `undefined`,
    );
  });

  it("computeDateChangeValue C should return undefined when time mode and no parsed date", () => {
    expect(
      computeDateChangeValue({ parsedDate: undefined, timeValue: "14:30", time: true, noonHour: 0 }),
    ).toMatchInlineSnapshot(`undefined`);
  });

  it("computeDateChangeValue D should return date with noon UTC when date-only mode and defaultToNoon", () => {
    const parsedDate = new Date("2025-06-15");
    const result = computeDateChangeValue({ parsedDate, timeValue: "", time: false, noonHour: 12 });
    expect(result?.getUTCHours()).toBe(12);
    expect(result?.getUTCMinutes()).toBe(0);
  });

  it("computeDateChangeValue E should return date with midnight UTC when date-only mode", () => {
    const parsedDate = new Date("2025-06-15");
    const result = computeDateChangeValue({ parsedDate, timeValue: "", time: false, noonHour: 0 });
    expect(result?.getUTCHours()).toBe(0);
  });

  it("computeDateChangeValue F should return undefined when date-only mode and no parsed date", () => {
    expect(
      computeDateChangeValue({ parsedDate: undefined, timeValue: "", time: false, noonHour: 0 }),
    ).toMatchInlineSnapshot(`undefined`);
  });

  // computeTimeChangeValue
  it("computeTimeChangeValue A should return new date with time when no date shown (time-only mode)", () => {
    const result = computeTimeChangeValue("14:30", undefined, false);
    expect(result).toBeInstanceOf(Date);
    expect(result?.getHours()).toBe(14);
    expect(result?.getMinutes()).toBe(30);
  });

  it("computeTimeChangeValue B should return undefined when time-only mode and invalid time", () => {
    expect(computeTimeChangeValue("", undefined, false)).toMatchInlineSnapshot(`undefined`);
  });

  it("computeTimeChangeValue C should return date with time when date is shown and date exists", () => {
    const existingDate = new Date("2025-06-15T00:00:00");
    const result = computeTimeChangeValue("09:15", existingDate, true);
    expect(result?.getHours()).toBe(9);
    expect(result?.getMinutes()).toBe(15);
  });

  it("computeTimeChangeValue D should return undefined when date is shown but no date exists", () => {
    expect(computeTimeChangeValue("09:15", undefined, true)).toMatchInlineSnapshot(`undefined`);
  });

  it("computeTimeChangeValue E should return undefined when date is shown and invalid time", () => {
    const existingDate = new Date("2025-06-15T00:00:00");
    expect(computeTimeChangeValue("", existingDate, true)).toMatchInlineSnapshot(`undefined`);
  });

  // calendarDateToUtc
  it("calendarDateToUtc A should convert calendar date to UTC with noon hour", () => {
    const calendarDate = new Date(2025, 5, 15);
    const result = calendarDateToUtc({ calendarDate, time: false, timeValue: "" });
    expect(result?.toISOString()).toMatchInlineSnapshot(`"2025-06-15T00:00:00.000Z"`);
  });

  it("calendarDateToUtc B should return undefined when calendarDate is undefined", () => {
    expect(calendarDateToUtc({ calendarDate: undefined, time: false, timeValue: "" })).toMatchInlineSnapshot(
      `undefined`,
    );
  });

  it("calendarDateToUtc C should apply time when in time mode with valid time", () => {
    const calendarDate = new Date(2025, 5, 15);
    const result = calendarDateToUtc({ calendarDate, time: true, timeValue: "14:30" });
    expect(result?.getUTCHours()).toBe(14);
    expect(result?.getUTCMinutes()).toBe(30);
  });

  it("calendarDateToUtc D time mode with invalid time", () => {
    const calendarDate = new Date(2025, 5, 15);
    const result = calendarDateToUtc({ calendarDate, time: true, timeValue: "" });
    expect(result?.getUTCHours()).toBe(0);
    expect(result?.getUTCMinutes()).toBe(0);
  });

  // isDigitKey
  it("isDigitKey A should return true for digit characters", () => {
    expect(isDigitKey("0")).toBe(true);
    expect(isDigitKey("5")).toBe(true);
    expect(isDigitKey("9")).toBe(true);
  });

  it("isDigitKey B should return false for non-digit characters", () => {
    expect(isDigitKey("a")).toBe(false);
    expect(isDigitKey("!")).toBe(false);
    expect(isDigitKey(" ")).toBe(false);
  });

  it("isDigitKey C should return false for multi-character strings", () => {
    expect(isDigitKey("12")).toBe(false);
    expect(isDigitKey("Enter")).toBe(false);
  });

  // isDateInputAtEnd
  it("isDateInputAtEnd A should return true when cursor is at end of complete date input", () => {
    expect(isDateInputAtEnd(10, 10)).toBe(true);
  });

  it("isDateInputAtEnd B should return false when cursor is not at end", () => {
    expect(isDateInputAtEnd(5, 10)).toBe(false);
  });

  it("isDateInputAtEnd C should return false when input is not complete", () => {
    expect(isDateInputAtEnd(5, 5)).toBe(false);
  });

  it("isDateInputAtEnd D should return false when selectionStart is null", () => {
    expect(isDateInputAtEnd(null, 10)).toBe(false);
  });

  // shouldShowClearButton
  it("shouldShowClearButton A should return true when dateValue is not empty", () => {
    expect(shouldShowClearButton("15/06/2025", "")).toBe(true);
  });

  it("shouldShowClearButton B should return true when timeValue has a real value", () => {
    expect(shouldShowClearButton("", "14:30")).toBe(true);
  });

  it("shouldShowClearButton C should return false when both are empty", () => {
    expect(shouldShowClearButton("", "")).toBe(false);
  });

  it("shouldShowClearButton D should return false when timeValue is placeholder --:--", () => {
    expect(shouldShowClearButton("", "--:--")).toBe(false);
  });

  it("shouldShowClearButton E should return true when both have values", () => {
    expect(shouldShowClearButton("15/06/2025", "14:30")).toBe(true);
  });
});
