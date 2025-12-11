import { getPage, getPath } from "./browser-routing.js";
import { isBrowserEnvironment } from "./environment.js";

it("isBrowserEnvironment A", () => {
  expect(isBrowserEnvironment()).toStrictEqual(false);
});

it("getPage A", () => {
  expect(getPage("")).toMatchInlineSnapshot('"index"');
});
it("getPage B", () => {
  expect(getPage("//contact")).toMatchInlineSnapshot('"contact"');
});
it("getPage C", () => {
  expect(getPage("/en/contact")).toMatchInlineSnapshot('"contact"');
});
it("getPage D", () => {
  expect(getPage("/fr/contact/top")).toMatchInlineSnapshot('"contact/top"');
});
it("getPage E", () => {
  expect(getPage("/fr/contact/top.html")).toMatchInlineSnapshot('"contact/top"');
});

it("getPath A", () => {
  expect(getPath("")).toMatchInlineSnapshot(`""`);
});
it("getPath B", () => {
  expect(getPath("/")).toMatchInlineSnapshot('"/"');
});
it("getPath C", () => {
  expect(getPath("/contact", "en")).toMatchInlineSnapshot('"/en/contact"');
});
it("getPath D", () => {
  expect(getPath("/en/contact", "en")).toMatchInlineSnapshot('"/en/contact"');
});
it("getPath E", () => {
  expect(getPath("/fr/contact", "en")).toMatchInlineSnapshot('"/en/contact"');
});
it("getPath F", () => {
  expect(getPath("//contact", "fr")).toMatchInlineSnapshot('"/fr/contact"');
});
it("getPath G", () => {
  expect(getPath("//us///super/contact", "us")).toMatchInlineSnapshot('"/us/super/contact"');
});

it('getPath H should handle url === "" and isBrowserEnvironment() === false', () => {
  // url is '', isBrowserEnvironment returns false
  const originalIsBrowserEnvironment = isBrowserEnvironment;
  // @ts-expect-error override for test
  globalThis.isBrowserEnvironment = () => false;
  expect(getPath("")).toBe("");
  // @ts-expect-error restore
  globalThis.isBrowserEnvironment = originalIsBrowserEnvironment;
});

it('getPath I should handle path === "blank"', () => {
  // Simulate browser environment
  const originalIsBrowserEnvironment = isBrowserEnvironment;
  const originalDocument = globalThis.document;
  const originalMatchMedia = globalThis.matchMedia;
  // @ts-expect-error override for test
  globalThis.matchMedia = () => true;
  // @ts-expect-error override for test
  globalThis.document = { location: { pathname: "blank" } };
  // @ts-expect-error override for test
  globalThis.isBrowserEnvironment = () => true;
  expect(getPath()).toBe("");
  // Restore
  if (originalDocument) {
    globalThis.document = originalDocument;
  }
  if (originalMatchMedia) {
    globalThis.matchMedia = originalMatchMedia;
  }
  // @ts-expect-error restore
  globalThis.isBrowserEnvironment = originalIsBrowserEnvironment;
});

it("getPath J should remove lang from path", () => {
  expect(getPath("/fr/contact")).toBe("/contact");
});

it("getPath K should add lang to path", () => {
  expect(getPath("/contact", "fr")).toBe("/fr/contact");
});

it("getPage L should handle path with only dots", () => {
  // This tests the edge case where split('.')[0] could be undefined
  // getPage('.') returns 'index' because getPath('.') returns '' which is the index page
  expect(getPage(".")).toBe("index");
});
