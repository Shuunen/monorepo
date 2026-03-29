import { arrayUnique } from "./array-unique.js";

describe(arrayUnique, () => {
  it("arrayUnique A clean number array", () => {
    expect(arrayUnique([1, 1, 2, 1, 1, 3, 1])).toStrictEqual([1, 2, 3]);
  });
  it("arrayUnique B clean string & number array", () => {
    expect(arrayUnique(["plop", "plop", 2, "plop", "plop", 3, "plop"])).toStrictEqual(["plop", 2, 3]);
  });
  it("arrayUnique C clean string & object array", () => {
    expect(arrayUnique([{ name: "John" }, "plop", { name: "John" }, 3, "plop"])).toStrictEqual([
      { name: "John" },
      "plop",
      { name: "John" },
      3,
    ]);
  });
});
