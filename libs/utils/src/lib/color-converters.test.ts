import { hexToHsl, hexToRgb } from "./color-converters.js";
import { Result } from "./result.js";

it("color hexToRgb A", () => {
  const result = Result.unwrap(hexToRgb("#f00"));
  expect(result.value).toStrictEqual({ colorBlue: 0, colorGreen: 0, colorRed: 255 });
  expect(result.error).toBeUndefined();
});

it("color hexToRgb B", () => {
  const result = Result.unwrap(hexToRgb("#0f0"));
  expect(result.value).toStrictEqual({ colorBlue: 0, colorGreen: 255, colorRed: 0 });
  expect(result.error).toBeUndefined();
});

it("color hexToRgb C", () => {
  const result = Result.unwrap(hexToRgb("#00f"));
  expect(result.value).toStrictEqual({ colorBlue: 255, colorGreen: 0, colorRed: 0 });
  expect(result.error).toBeUndefined();
});

it("color hexToRgb D", () => {
  const result = Result.unwrap(hexToRgb("#ff0000"));
  expect(result.value).toStrictEqual({ colorBlue: 0, colorGreen: 0, colorRed: 255 });
  expect(result.error).toBeUndefined();
});

it("color hexToRgb E", () => {
  const result = Result.unwrap(hexToRgb("#00"));
  expect(result.value).toBeUndefined();
  expect(result.error).toMatchInlineSnapshot(`"Invalid HEX color provided : #00, should have a length of 4 or 7 instead of : 3"`);
});

it("color hexToHsl A red short", () => {
  expect(hexToHsl("#f00")).toStrictEqual({ hue: 0, lightness: 50, saturation: 100 });
});

it("color hexToHsl B red long", () => {
  expect(hexToHsl("#ff0000")).toStrictEqual({ hue: 0, lightness: 50, saturation: 100 });
});

it("color hexToHsl C", () => {
  expect(hexToHsl("#663399")).toStrictEqual({ hue: 270, lightness: 40, saturation: 50 });
});

it("color hexToHsl D", () => {
  expect(hexToHsl("#000000")).toStrictEqual({ hue: 0, lightness: 0, saturation: 0 });
});

it("color hexToHsl E", () => {
  expect(hexToHsl("#ffffff")).toStrictEqual({ hue: 0, lightness: 100, saturation: 0 });
});

it("color hexToHsl F green short", () => {
  expect(hexToHsl("#0f0")).toStrictEqual({ hue: 120, lightness: 50, saturation: 100 });
});

it("color hexToHsl G green long", () => {
  expect(hexToHsl("#00ff00")).toStrictEqual({ hue: 120, lightness: 50, saturation: 100 });
});

it("color hexToHsl H blue short", () => {
  expect(hexToHsl("#00f")).toStrictEqual({ hue: 240, lightness: 50, saturation: 100 });
});

it("color hexToHsl I invalid", () => {
  expect(hexToHsl("0f")).toMatchInlineSnapshot(`
    Err {
      "error": "Invalid HEX color provided : 0f, should have a length of 4 or 7 instead of : 2",
      "ok": false,
    }
  `);
});

it("color hexToHsl J negative hue (hue < 0 branch)", () => {
  expect(hexToHsl("#ff0080")).toStrictEqual({ hue: 330, lightness: 50, saturation: 100 });
});
