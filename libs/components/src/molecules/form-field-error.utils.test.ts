import { stringify } from "@monorepo/utils";
import { computeCustomErrorMessage, getCustomErrorAction } from "./form-field-error.utils";

const errorFnDynamicError = (data: Record<string, unknown>) => (data.age === 0 ? "Age must be positive" : undefined);
const errorFnReturningNoError = () => undefined;
const errorFnReturningError = () => "some error";
const errorFnUsingParentData = (_data: Record<string, unknown>, parentData?: Record<string, unknown>) =>
  parentData?.country === "FR" ? "Not available in France" : undefined;

describe("form-field-error.utils", () => {
  // computeCustomErrorMessage
  it("computeCustomErrorMessage A should return undefined when no custom error function is provided", () => {
    const result = computeCustomErrorMessage(undefined, {});
    expect(result).toMatchInlineSnapshot(`undefined`);
  });
  it("computeCustomErrorMessage B should return undefined when watched values are null", () => {
    // @ts-expect-error testing invalid input
    const result = computeCustomErrorMessage(errorFnReturningError, null);
    expect(result).toMatchInlineSnapshot(`undefined`);
  });
  it("computeCustomErrorMessage C should return undefined when watched values are undefined", () => {
    // @ts-expect-error testing invalid input
    const result = computeCustomErrorMessage(errorFnReturningError, undefined);
    expect(result).toMatchInlineSnapshot(`undefined`);
  });
  it("computeCustomErrorMessage D should return undefined when watched values are an empty object", () => {
    const result = computeCustomErrorMessage(errorFnReturningError, {});
    expect(result).toMatchInlineSnapshot(`undefined`);
  });
  it("computeCustomErrorMessage E should call the error function and return its result when values are valid", () => {
    const result = computeCustomErrorMessage(errorFnDynamicError, { age: 0 });
    expect(result).toMatchInlineSnapshot(`"Age must be positive"`);
  });
  it("computeCustomErrorMessage F should return undefined when the error function returns undefined", () => {
    const result = computeCustomErrorMessage(errorFnReturningNoError, { name: "John" });
    expect(result).toMatchInlineSnapshot(`undefined`);
  });
  it("computeCustomErrorMessage G should pass parentData to error function when provided", () => {
    const result = computeCustomErrorMessage(errorFnUsingParentData, { name: "John" }, { country: "FR" });
    expect(result).toMatchInlineSnapshot(`"Not available in France"`);
  });
  it("computeCustomErrorMessage H should pass undefined parentData when not provided", () => {
    const result = computeCustomErrorMessage(errorFnUsingParentData, { name: "John" });
    expect(result).toMatchInlineSnapshot(`undefined`);
  });

  // getCustomErrorAction
  it("getCustomErrorAction A should return none when no custom error function exists", () => {
    const result = getCustomErrorAction(false, undefined, undefined);
    expect(stringify(result)).toMatchInlineSnapshot(`"{"type":"none"}"`);
  });
  it("getCustomErrorAction B should return set-error when there is a new error message", () => {
    const result = getCustomErrorAction(true, "field is required", undefined);
    expect(stringify(result)).toMatchInlineSnapshot(`"{"message":"field is required","type":"set-error"}"`);
  });
  it("getCustomErrorAction C should return set-error when the error message changed", () => {
    const result = getCustomErrorAction(true, "new error", "old error");
    expect(stringify(result)).toMatchInlineSnapshot(`"{"message":"new error","type":"set-error"}"`);
  });
  it("getCustomErrorAction D should return none when the error message is the same as last time", () => {
    const result = getCustomErrorAction(true, "same error", "same error");
    expect(stringify(result)).toMatchInlineSnapshot(`"{"type":"none"}"`);
  });
  it("getCustomErrorAction E should return clear-error when error is gone and last error was set", () => {
    const result = getCustomErrorAction(true, undefined, "previous error");
    expect(stringify(result)).toMatchInlineSnapshot(`"{"type":"clear-error"}"`);
  });
  it("getCustomErrorAction F should return none when there is no error and no last error", () => {
    const result = getCustomErrorAction(true, undefined, undefined);
    expect(stringify(result)).toMatchInlineSnapshot(`"{"type":"none"}"`);
  });
  it("getCustomErrorAction G should return set-error when there is a empty error message", () => {
    const result = getCustomErrorAction(true, "", undefined);
    expect(stringify(result)).toMatchInlineSnapshot(`"{"message":"","type":"set-error"}"`);
  });
});
