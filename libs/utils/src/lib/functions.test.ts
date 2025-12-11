import { functionReturningUndefined, functionReturningVoid, hasOwn } from "./functions.js";

it("hasOwn A", () => {
  expect(hasOwn({ propA: 1 }, "propA")).toBe(true);
});
it("hasOwn B", () => {
  expect(hasOwn({ propA: 1 }, "propB")).toBe(false);
});
it("hasOwn C", () => {
  expect(hasOwn({ propA: 1 }, "toString")).toBe(false);
});
it("hasOwn D", () => {
  expect(hasOwn({ propA: 1 }, "hasOwnProperty")).toBe(false);
});

it("functionReturningVoid A", () => {
  expect(functionReturningVoid()).toMatchInlineSnapshot(`undefined`);
});

it("functionReturningUndefined A", () => {
  expect(functionReturningUndefined()).toMatchInlineSnapshot(`undefined`);
});
