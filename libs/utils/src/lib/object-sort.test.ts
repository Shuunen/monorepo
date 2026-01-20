import { objectEqual } from "./object-equal.js";
import { objectSort } from "./object-sort.js";

it("objectSort A sort a simple object", () => {
  const object = { keyC: 3, keyA: 1, keyB: 2 };
  const sorted = objectSort(object);
  // we cannot use toStrictEqual because toStrictEqual does not check the order of the keys, objectEqual does
  expect(objectEqual(sorted, { keyA: 1, keyB: 2, keyC: 3 })).toBe(true);
});

it("objectSort B sort a 2 level object", () => {
  const object = { keyC: 3, keyA: 1, alpaca: { c3: 33, c1: 11, c2: 22 }, keyB: 2 };
  const sorted = objectSort(object);
  expect(objectEqual(sorted, { alpaca: { c1: 11, c2: 22, c3: 33 }, keyA: 1, keyB: 2, keyC: 3 })).toBe(true);
});

it("objectSort C sort a complex object with null, undefined, etc", () => {
  const alpaca = { c3: 33, c1: 11, c4: undefined, c2: 22 };
  const names = ["john", null, [{ c3: 3, b2: 2 }], "eddy"];
  const zebra = { z3: 33, z1: 11, z2: null };
  const object = {
    keyC: 3,
    keyA: undefined,
    alpaca,
    names,
    keyB: 2,
    zebra,
  };
  const sorted = objectSort(object);
  expect(sorted).toMatchSnapshot();
});
