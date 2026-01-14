import { isEmpty } from "./object-is-empty.js";

it("isEmpty A on empty object", () => {
  expect(isEmpty({})).toBe(true);
});

it("isEmpty B on non-empty object", () => {
  expect(isEmpty({ name: "John" })).toBe(false);
});
