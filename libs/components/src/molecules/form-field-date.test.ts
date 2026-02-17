import { describe, expect, it } from "vitest";
import { z } from "zod";
import { field } from "./auto-form.utils";
import { getInitialValue, normalizeToDate, today } from "./form-field-date.utils";

describe("form-field-date", () => {
  it("getInitialValue A date default value", () => {
    const defaultDate = new Date("2024-06-01");
    const schema = field(z.date().prefault(defaultDate));
    expect(getInitialValue(schema)).toEqual(defaultDate);
  });

  it("getInitialValue B relative date", () => {
    const schemaToday = field(z.date().prefault(today));
    expect(getInitialValue(schemaToday)).toEqual(today);
  });

  it("getInitialValue C no default value", () => {
    const schema = field(z.date());
    expect(getInitialValue(schema)).toBeUndefined();
  });

  it("getInitialValue D default relative date", () => {
    const date = getInitialValue(z.date().default(today));
    expect(date).toEqual(today);
  });

  it("normalizeToDate A should return the same Date when given a Date", () => {
    const date = new Date("2024-06-01");
    expect(normalizeToDate(date)).toEqual(date);
  });

  it("normalizeToDate B should parse a date string into a Date", () => {
    expect(normalizeToDate("2024-06-01")).toEqual(new Date("2024-06-01"));
  });

  it("normalizeToDate C should return undefined for undefined", () => {
    expect(normalizeToDate(undefined)).toBeUndefined();
  });

  it("normalizeToDate D should return undefined for null", () => {
    expect(normalizeToDate(null)).toBeUndefined();
  });

  it("normalizeToDate E should return undefined for empty string", () => {
    expect(normalizeToDate("")).toBeUndefined();
  });

  it("normalizeToDate F should return undefined for weird types", () => {
    expect(normalizeToDate({})).toBeUndefined();
  });
});
