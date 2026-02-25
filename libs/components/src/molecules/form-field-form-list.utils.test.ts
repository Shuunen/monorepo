import type { AutoFormData } from "./auto-form.types";
import { isSubformFilled, nbFilledItems } from "./form-field-form-list.utils";

describe("form-field-form-list.utils", () => {
  // isSubformFilled
  it("isSubformFilled A string", () => {
    const data = { name: "John doe" };
    expect(isSubformFilled(data)).toBe(true);
  });
  it("isSubformFilled B date", () => {
    const data = { dateFrom: new Date() };
    expect(isSubformFilled(data)).toBe(true);
  });
  it("isSubformFilled C array", () => {
    const data = { dates: [new Date()] };
    expect(isSubformFilled(data)).toBe(true);
  });
  it("isSubformFilled D object", () => {
    const data = { infos: { name: "John doe" } };
    expect(isSubformFilled(data)).toBe(true);
  });
  it("isSubformFilled E empty string", () => {
    const data = { name: "" };
    expect(isSubformFilled(data)).toBe(false);
  });
  it("isSubformFilled F default boolean", () => {
    const data = { isOk: false };
    expect(isSubformFilled(data)).toBe(false);
  });
  it("isSubformFilled G empty array", () => {
    const data = { dates: [] };
    expect(isSubformFilled(data)).toBe(false);
  });
  it("isSubformFilled H empty object", () => {
    const data = { infos: {} };
    expect(isSubformFilled(data)).toBe(false);
  });
  it("isSubformFilled I undefined", () => {
    const data = { infos: undefined };
    expect(isSubformFilled(data)).toBe(false);
  });
  it("isSubformFilled J null", () => {
    const data = { infos: null };
    expect(isSubformFilled(data)).toBe(false);
  });

  // nbFilledItems
  it("nbFilledItems A should return 0 when undefined", () => {
    expect(nbFilledItems()).toBe(0);
  });
  it("nbFilledItems B should return 0 when not an array", () => {
    expect(nbFilledItems({ name: "John doe" })).toBe(0);
  });
  it("nbFilledItems C should return 0 when no items", () => {
    expect(nbFilledItems([])).toBe(0);
  });
  it("nbFilledItems D should return 1 when one item is filled", () => {
    expect(nbFilledItems([{ name: "John doe" }])).toBe(1);
  });
  it("nbFilledItems E should return 2 when two items are filled", () => {
    expect(nbFilledItems([{ name: "John doe" }, { name: "Jane doe" }])).toBe(2);
  });
  it("nbFilledItems F should return 0 when all items are empty", () => {
    const data = [{}, { infos: null }, { infos: undefined }, { infos: {} }, { infos: [] }, null, undefined, "", false];
    expect(nbFilledItems(data as AutoFormData[])).toBe(0);
  });
});
