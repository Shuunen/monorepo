import { removeValueFromArray } from "./array-remove-value.js";

describe(removeValueFromArray, () => {
  it("removeValueFromArray A remove existing value", () => {
    expect(removeValueFromArray([1, 2, 3, 4], 2)).toStrictEqual([1, 3, 4]);
  });
  it("removeValueFromArray B remove duplicate value", () => {
    expect(removeValueFromArray([1, 2, 2, 3], 2)).toStrictEqual([1, 2, 3]);
  });
  it("removeValueFromArray C remove non-existing value", () => {
    expect(removeValueFromArray([1, 3], 2)).toStrictEqual([1, 3]);
  });
  it("removeValueFromArray D remove from empty array", () => {
    expect(removeValueFromArray([], 2)).toStrictEqual([]);
  });
});
