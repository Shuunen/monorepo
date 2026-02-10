import { describe, expect, it } from "vitest";
import { fieldDate, getInitialValue } from "./form-field-date.utils";
import { dateIso10, daysAgo } from "@monorepo/utils";
import { z } from "zod";

describe("form-field-date", () => {
  const today = new Date(dateIso10());
  const yesterday = new Date(dateIso10(daysAgo(1)));
  const tomorrow = new Date(dateIso10(daysAgo(-1)));

  it("fieldDate A minDate", () => {
    const schema = fieldDate({ minDate: "today" });
    expect(schema.safeParse(yesterday).success).toBe(false);
    expect(schema.safeParse(today).success).toBe(true);
  });

  it("fieldDate B maxDate", () => {
    const schema = fieldDate({ maxDate: "today" });
    expect(schema.safeParse(yesterday).success).toBe(true);
    expect(schema.safeParse(today).success).toBe(true);
    expect(schema.safeParse(tomorrow).success).toBe(false);
  });

  it("fieldDate C minDate and maxDate", () => {
    const schema = fieldDate({ minDate: "yesterday", maxDate: "tomorrow" });
    expect(schema.safeParse(daysAgo(2)).success).toBe(false);
    expect(schema.safeParse(yesterday).success).toBe(true);
    expect(schema.safeParse(today).success).toBe(true);
    expect(schema.safeParse(tomorrow).success).toBe(true);
    expect(schema.safeParse(daysAgo(-2)).success).toBe(false);
  });

  it("fieldDate D unhandled relative date", () => {
    // @ts-expect-error testing unhandled relative date
    expect(() => fieldDate({ minDate: "invalid-date" })).toThrowError("Unhandled relative date : invalid-date");
  });

  it("fieldDate E real date", () => {
    const minDate = new Date("2024-01-01");
    const maxDate = new Date("2024-12-31");
    const schema = fieldDate({ minDate, maxDate });
    expect(schema.safeParse(new Date("2023-12-31")).success).toBe(false);
    expect(schema.safeParse(minDate).success).toBe(true);
    expect(schema.safeParse(new Date("2024-06-01")).success).toBe(true);
    expect(schema.safeParse(maxDate).success).toBe(true);
    expect(schema.safeParse(new Date("2025-01-01")).success).toBe(false);
  });

  it("getInitialValue A date default value", () => {
    const defaultDate = new Date("2024-06-01");
    const schema = fieldDate({ initialValue: defaultDate });
    expect(getInitialValue(schema)).toEqual(defaultDate);
  });

  it("getInitialValue B relative date", () => {
    const schemaToday = fieldDate({ initialValue: "today" });
    expect(getInitialValue(schemaToday), "today").toEqual(today);
    const schemaYesterday = fieldDate({ initialValue: "yesterday" });
    expect(getInitialValue(schemaYesterday), "yesterday").toEqual(yesterday);
    const schemaTomorrow = fieldDate({ initialValue: "tomorrow" });
    expect(getInitialValue(schemaTomorrow), "tomorrow").toEqual(tomorrow);
  });

  it("getInitialValue C no default value", () => {
    const schema = fieldDate({});
    expect(getInitialValue(schema)).toBeUndefined();
  });

  it("getInitialValue D default relative date", () => {
    // @ts-expect-error relative date are not expected by zod
    const date = getInitialValue(z.date().default("today"));
    expect(date).toEqual(today);
  });
});
