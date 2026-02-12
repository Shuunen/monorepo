import { describe, expect, it } from "vitest";
import { z } from "zod";
import { field } from "./auto-form.utils";
import { getInitialValue, today } from "./form-field-date.utils";

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
});
