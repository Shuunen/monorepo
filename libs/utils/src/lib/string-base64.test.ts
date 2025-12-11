import { isBase64, parseBase64 } from "./string-base64.js";

describe("string-base64", () => {
  it("isBase64 valid with data", () => {
    expect(isBase64("data:image/png;base64,iVBORw0KGgoYII=")).toBe(true);
  });
  it("isBase64 valid with data & double equal", () => {
    expect(isBase64("data:image/png;base64,iVBORw0KGgoYII==")).toBe(true);
  });
  it("isBase64 valid without data", () => {
    expect(isBase64("image/jpg;base64,iVBORw0KGgoYII=")).toBe(true);
  });
  it("isBase64 invalid, missing first char", () => {
    expect(isBase64("ata:image/png;base64,iVBORw0KGgoYII=")).toBe(false);
  });
  it("isBase64 invalid because empty", () => {
    expect(isBase64("")).toBe(false);
  });

  it("parseBase64 png image", () => {
    expect(parseBase64("data:image/png;base64,iVBORw0KGgoYII=")).toStrictEqual({
      base64: "iVBORw0KGgoYII=",
      size: 11,
      type: "image/png",
    });
  });
  it("parseBase64 jpg image", () => {
    expect(parseBase64("image/jpg;base64,iVBORw0KGgoYII=")).toStrictEqual({
      base64: "iVBORw0KGgoYII=",
      size: 11,
      type: "image/jpg",
    });
  });
  it("parseBase64 jpeg image", () => {
    expect(parseBase64("image/jpeg;base64,iVBORw0KGgoYII=")).toStrictEqual({
      base64: "iVBORw0KGgoYII=",
      size: 11,
      type: "image/jpeg",
    });
  });
  it("parseBase64 invalid, missing type", () => {
    expect(parseBase64(";base64,iVBORw0KGgoYII")).toStrictEqual({ base64: "", size: 0, type: "" });
  });
  it("parseBase64 invalid because empty", () => {
    expect(parseBase64("")).toStrictEqual({ base64: "", size: 0, type: "" });
  });
  it("parseBase64 G invalid format without base64 part", () => {
    expect(parseBase64("image/png;iVBORw0KGgoYII=")).toStrictEqual({ base64: "", size: 0, type: "" });
  });
  it("parseBase64 H edge case with split but no valid content", () => {
    expect(parseBase64("data:;base64,")).toMatchInlineSnapshot(`
      {
        "base64": "",
        "size": 0,
        "type": "",
      }
    `);
  });
  it("parseBase64 I edge case when regex doesnt match type", () => {
    // This tests the typeof type[0] === 'string' check
    // When the string doesn't match the base64 pattern, it returns empty result
    expect(parseBase64("not-a-base64-string")).toStrictEqual({ base64: "", size: 0, type: "" });
  });
  it("parseBase64 J edge case when split doesnt find base64 data", () => {
    // This tests the typeof base64[1] === 'string' check
    // When split doesn't find a second part after 'base64,'
    expect(parseBase64("data:image/png;base64")).toStrictEqual({ base64: "", size: 0, type: "" });
  });
  it("parseBase64 K valid base64 without type prefix", () => {
    // Valid base64 format without 'data:' prefix - tests typeMatch being null
    expect(parseBase64("image/jpeg;base64,ABC123DEF456")).toMatchInlineSnapshot(`
      {
        "base64": "ABC123DEF456",
        "size": 9,
        "type": "image/jpeg",
      }
    `);
  });
});
