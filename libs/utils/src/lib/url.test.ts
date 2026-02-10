import { describe, expect, it } from "vitest";
import { base64CharToPercentEncoded, decodeFromUrl, encodeForUrl, fromBase64, toBase64 } from "./url.js";

describe("url", () => {
  it("toBase64 A should encode a string to base64", () => {
    expect(toBase64("hello")).toMatchInlineSnapshot(`"aGVsbG8="`);
  });

  it("toBase64 B should encode an empty string to base64", () => {
    expect(toBase64("")).toMatchInlineSnapshot(`""`);
  });

  it("fromBase64 A should decode a base64 string", () => {
    expect(fromBase64("aGVsbG8=")).toMatchInlineSnapshot(`"hello"`);
  });

  it("fromBase64 B should decode an empty string", () => {
    expect(fromBase64("")).toMatchInlineSnapshot(`""`);
  });

  it("fromBase64 C should handle malformed base64 safely", () => {
    expect(fromBase64("!!!invalid!!!")).toMatchInlineSnapshot(`""`);
  });

  it("toBase64 C should handle special unicode characters", () => {
    const result = toBase64("Hello 🌍 World ñ");
    expect(fromBase64(result)).toMatchInlineSnapshot(`"Hello 🌍 World ñ"`);
  });

  it("fromBase64 D should handle base64 with special characters", () => {
    const encoded = toBase64("Test\u0000\u0001\u0002");
    expect(fromBase64(encoded)).toMatchInlineSnapshot(`"Test\u0000\u0001\u0002"`);
  });

  it("encodeForUrl A should encode object data for URL", () => {
    expect(encodeForUrl({ foo: "bar" })).toMatchInlineSnapshot(`"eyJmb28iOiJiYXIifQ%3D%3D"`);
  });

  it("encodeForUrl B should encode array data for URL", () => {
    expect(encodeForUrl([1, 2, 3])).toMatchInlineSnapshot(`"WzEsMiwzXQ%3D%3D"`);
  });

  it("encodeForUrl C should encode an empty string for URL", () => {
    expect(encodeForUrl("")).toMatchInlineSnapshot(`"IiI%3D"`);
  });

  it("decodeUrl A should decode object data from URL", () => {
    expect(decodeFromUrl("eyJmb28iOiJiYXIifQ%3D%3D")).toEqual({ foo: "bar" });
  });

  it("decodeUrl B should decode array data from URL", () => {
    expect(decodeFromUrl("WzEsMiwzXQ%3D%3D")).toEqual([1, 2, 3]);
  });

  it("decodeUrl C should decode an empty string from URL", () => {
    expect(decodeFromUrl("IiI%3D")).toBe("");
  });

  it("decodeUrl D should return empty string for invalid data", () => {
    expect(decodeFromUrl("invalid")).toBe("");
  });

  it("base64CharToPercentEncoded A should handle empty string", () => {
    expect(base64CharToPercentEncoded("")).toMatchInlineSnapshot(`"%00"`);
  });
});
