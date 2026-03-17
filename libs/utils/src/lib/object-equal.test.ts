import { objectEqual } from "./object-equal.js";

describe(objectEqual, () => {
  const object4 = { fool: { bar: "foo", regex: /^ho\d+$/iu }, keyA: 1, keyB: 2, keyC: 3 };
  const object4ButAnotherReference = { fool: { bar: "foo", regex: /^ho\d+$/iu }, keyA: 1, keyB: 2, keyC: 3 };

  it("objectEqual A true for empty objects", () => {
    expect(objectEqual({}, {})).toBe(true);
  });

  it("objectEqual B true for objects with same keys", () => {
    expect(objectEqual({ keyA: 1, keyB: 2, keyC: 3 }, { keyA: 1, keyB: 2, keyC: 3 })).toBe(true);
  });

  it("objectEqual C false for objects with different keys", () => {
    expect(objectEqual({ keyA: 1, keyB: 2, keyC: 3 }, { keyA: 1, keyB: 2, keyD: 3 })).toBe(false);
  });
  it("objectEqual D false for objects with different values", () => {
    expect(objectEqual({ keyA: 1, keyB: 2, keyC: 3 }, { keyA: 1, keyB: 2, keyC: 4 })).toBe(false);
  });
  it("objectEqual E true with objects containing same literals", () => {
    expect(objectEqual({ bar: 2, fool: 1 }, { bar: 2, fool: 1 })).toBe(true);
  });
  it("objectEqual F true for deeply nested objects", () => {
    expect(
      objectEqual({ fool: { bar: "foo", regex: /^ho\d+$/iu } }, { fool: { bar: "foo", regex: /^ho\d+$/iu } }),
    ).toBe(true);
  });
  it("objectEqual H false with objects containing different literals", () => {
    expect(objectEqual({ bar: 1, fool: 1 }, { bar: 2, fool: 1 })).toBe(false);
  });
  it("objectEqual I true with same objects but different references", () => {
    expect(objectEqual(object4, object4ButAnotherReference)).toBe(true);
  });
  it("objectEqual J false with same objects but different key order", () => {
    expect(objectEqual({ keyA: 1, keyB: 2, keyC: 3 }, { keyC: 3, keyA: 1, keyB: 2 })).toBe(false);
  });
  it("objectEqual K true with same objects, different key order but key sort is active", () => {
    expect(objectEqual({ keyA: 1, keyB: 2, keyC: 3 }, { keyC: 3, keyA: 1, keyB: 2 }, true)).toBe(true);
  });
});
