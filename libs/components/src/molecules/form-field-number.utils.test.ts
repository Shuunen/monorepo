import { z } from "zod";
import { getZodNumberMinMax, toLocalValue } from "./form-field-number.utils";

const simpleNumberSchema = z.number();
const minMaxNumberSchema = z.number().min(10).max(20);
const onlyMinSchema = z.number().min(10);
const maxZeroSchema = z.number().max(0);
const minZeroSchema = z.number().min(0);
const minMaxZeroSchema = z.number().min(0).max(0);

describe("form-field-number.utils", () => {
  it("toLocalValue must return a string", () => {
    const value = toLocalValue(15);
    expect(value).toBe("15");
  });

  it("toLocalValue must return an empty string", () => {
    const value = toLocalValue(undefined);
    expect(value).toBe("");
  });

  it("toLocaleValue must return an empty string for null", () => {
    const value = toLocalValue(null);
    expect(value).toBe("");
  });

  it("getZodNumberMinMax must return the min and max", () => {
    const { min, max } = getZodNumberMinMax(minMaxNumberSchema);
    expect(min).toBe(10);
    expect(max).toBe(20);
  });

  it("getZodNumberMinMax must return undefined min and max", () => {
    const { min, max } = getZodNumberMinMax(simpleNumberSchema);
    expect(min).toBe(undefined);
    expect(max).toBe(undefined);
  });

  it("getZodNumberMinMax must handle only min schema", () => {
    const { min, max } = getZodNumberMinMax(onlyMinSchema);
    expect(min).toBe(10);
    expect(max).toBe(undefined);
  });

  it("getZodNumberMinMax must handle only min schema", () => {
    const { min, max } = getZodNumberMinMax(onlyMinSchema);
    expect(min).toBe(10);
    expect(max).toBe(undefined);
  });

  it("getZodNumberMinMax must handle min = 0", () => {
    const { min, max } = getZodNumberMinMax(minZeroSchema);
    expect(min).toBe(0);
    expect(max).toBe(undefined);
  });

  it("getZodNumberMinMax must handle max = 0", () => {
    const { min, max } = getZodNumberMinMax(maxZeroSchema);
    expect(min).toBe(undefined);
    expect(max).toBe(0);
  });

  it("getZodNumberMinMax must handle min and max = 0", () => {
    const { min, max } = getZodNumberMinMax(minMaxZeroSchema);
    expect(min).toBe(0);
    expect(max).toBe(0);
  });
});
