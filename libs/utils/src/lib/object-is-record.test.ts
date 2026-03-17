import { isRecord } from "./object-is-record.js";

describe(isRecord, () => {
  it("isRecord A on null", () => {
    expect(isRecord(null)).toBe(false);
  });
  it("isRecord B on an array", () => {
    expect(isRecord([1, 2])).toBe(false);
  });
  it("isRecord C on an empty array", () => {
    expect(isRecord([])).toBe(false);
  });
  it("isRecord D on an empty string", () => {
    expect(isRecord("")).toBe(false);
  });
  it("isRecord E on a number", () => {
    expect(isRecord(-1)).toBe(false);
  });
  it("isRecord F on an empty record", () => {
    expect(isRecord({})).toBe(true);
  });
  it("isRecord G on a record", () => {
    expect(isRecord({ name: "John" })).toBe(true);
  });
});
