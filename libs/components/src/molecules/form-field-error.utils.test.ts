import { describe, expect, it } from "vitest";
import { computeCustomErrorMessage, getCustomErrorAction } from "./form-field-error.utils";

const errorFnDynamicError = (data: Record<string, unknown>) => (data.age === 0 ? "Age must be positive" : undefined);
const errorFnReturningNoError = () => undefined;
const errorFnReturningError = () => "some error";

describe("form-field-error.utils", () => {
  it("computeCustomErrorMessage A should return undefined when no custom error function is provided", () => {
    expect(computeCustomErrorMessage(undefined, {})).toMatchInlineSnapshot(`undefined`);
  });

  it("computeCustomErrorMessage B should return undefined when watched values are not a plain object", () => {
    expect(computeCustomErrorMessage(errorFnReturningError, null)).toMatchInlineSnapshot(`undefined`);
    expect(computeCustomErrorMessage(errorFnReturningError, "string")).toMatchInlineSnapshot(`undefined`);
    expect(computeCustomErrorMessage(errorFnReturningError, 42)).toMatchInlineSnapshot(`undefined`);
  });

  it("computeCustomErrorMessage C should return undefined when watched values are an empty object", () => {
    expect(computeCustomErrorMessage(errorFnReturningError, {})).toMatchInlineSnapshot(`undefined`);
  });

  it("computeCustomErrorMessage D should call the error function and return its result when values are valid", () => {
    expect(computeCustomErrorMessage(errorFnDynamicError, { age: 0 })).toMatchInlineSnapshot(`"Age must be positive"`);
  });

  it("computeCustomErrorMessage E should return undefined when the error function returns undefined", () => {
    expect(computeCustomErrorMessage(errorFnReturningNoError, { name: "John" })).toMatchInlineSnapshot(`undefined`);
  });

  it("getCustomErrorAction A should return none when no custom error function exists", () => {
    expect(getCustomErrorAction(false, undefined, undefined)).toMatchInlineSnapshot(`
      {
        "type": "none",
      }
    `);
    expect(getCustomErrorAction(false, "error", undefined)).toMatchInlineSnapshot(`
      {
        "type": "none",
      }
    `);
  });

  it("getCustomErrorAction B should return set-error when there is a new error message", () => {
    expect(getCustomErrorAction(true, "field is required", undefined)).toMatchInlineSnapshot(`
      {
        "message": "field is required",
        "type": "set-error",
      }
    `);
  });

  it("getCustomErrorAction C should return set-error when the error message changed", () => {
    expect(getCustomErrorAction(true, "new error", "old error")).toMatchInlineSnapshot(`
      {
        "message": "new error",
        "type": "set-error",
      }
    `);
  });

  it("getCustomErrorAction D should return none when the error message is the same as last time", () => {
    expect(getCustomErrorAction(true, "same error", "same error")).toMatchInlineSnapshot(`
      {
        "type": "none",
      }
    `);
  });

  it("getCustomErrorAction E should return clear-error when error is gone and last error was set", () => {
    expect(getCustomErrorAction(true, undefined, "previous error")).toMatchInlineSnapshot(`
      {
        "type": "clear-error",
      }
    `);
  });

  it("getCustomErrorAction F should return none when there is no error and no last error", () => {
    expect(getCustomErrorAction(true, undefined, undefined)).toMatchInlineSnapshot(`
      {
        "type": "none",
      }
    `);
  });
});
