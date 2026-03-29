import { insertValueAfterItem } from "./array-insert-after.js";

describe(insertValueAfterItem, () => {
  it("insertValueAfterItem A insert value after existing item", () => {
    expect(insertValueAfterItem([1, 2, 3, 5], 3, 4)).toStrictEqual([1, 2, 3, 4, 5]);
  });
  it("insertValueAfterItem B insert value after string item", () => {
    expect(insertValueAfterItem([1, "deux", 3], 3, 4)).toStrictEqual([1, "deux", 3, 4]);
  });
  it("insertValueAfterItem C insert value after first item", () => {
    expect(insertValueAfterItem([1, "deux", 3], 1, 1.5)).toStrictEqual([1, 1.5, "deux", 3]);
  });
  it("insertValueAfterItem D insert value after non-existing item", () => {
    expect(insertValueAfterItem([1, 2, 3], 4, 4)).toStrictEqual([1, 2, 3]);
  });
  it("insertValueAfterItem E insert value into empty array", () => {
    expect(insertValueAfterItem([], 4, 4)).toStrictEqual([]);
  });
});
