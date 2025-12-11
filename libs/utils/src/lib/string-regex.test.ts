import { isHtml } from "./string-regex.js";

describe("string-regex", () => {
  it("isHtml on html", () => {
    expect(isHtml('<lyf-wc-icon name="logo"></lyf-wc-icon>')).toBe(true);
  });
  it("isHtml valid on malformed html", () => {
    expect(isHtml('<lyf-wc-icon name="logo"></i')).toBe(true);
  });
  it("isHtml valid on bad html", () => {
    expect(isHtml('<lyf-wc-icon name="logo"')).toBe(false);
  });
  it("isHtml on text", () => {
    expect(isHtml("Hello")).toBe(false);
  });
});
