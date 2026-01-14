import { clone } from "./object-clone.js";
import { objectEqual } from "./object-equal.js";
import { flatten } from "./object-flatten.js";
import { objectSort } from "./object-sort.js";
import { byProperty, genClass, isRecord, objectSum } from "./objects.js";

describe("objects", () => {
  const person = {
    age: 21,
    details: { dateOfBirth: new Date("2001-12-22"), favoriteFood: "sushi" },
    name: "John",
    nameRegex: /^jo/iu,
    nameValid: true,
    nameValidator: (input: string) => input.length > 3,
  };
  const personClone = clone(person);
  const personCloneModified = clone(person);
  personCloneModified.age = 42;
  it("clone A record", () => {
    expect(personCloneModified.age).toBe(42);
  });
  it("clone B record does not affect the original one", () => {
    expect(person.age).toBe(21);
  });

  const persons = ["John", "Fanny"];
  const personsCopy = clone(persons);
  personsCopy[1] = "Bob";
  it("clone C array", () => {
    expect(personsCopy[1]).toBe("Bob");
  });
  it("clone D array does not affect the original one", () => {
    expect(persons[1]).toBe("Fanny");
  });
  it("clone E original and clone are have the same objectSum", () => {
    expect(objectSum(person)).toBe(objectSum(personClone));
  });
  it("clone F original and clone are equals via objectEqual", () => {
    expect(objectEqual(person, personClone)).toBe(true);
  });
  it("clone G two clones are equals via objectEqual", () => {
    expect(objectEqual(clone(person), clone(person))).toBe(true);
  });
  it("clone H cloned values keep their type", () => {
    const cloned = clone(person);
    expect(typeof cloned.nameValidator).toBe("function");
    expect(typeof cloned.nameRegex).toBe("object");
    expect(cloned.nameRegex instanceof RegExp).toBe(true);
    expect(typeof cloned.details.dateOfBirth).toBe("object");
    expect(cloned.details.dateOfBirth instanceof Date).toBe(true);
  });
  it("clone I debug", () => {
    expect({ person, personCopy: personCloneModified }).toMatchSnapshot();
  });

  it("flatten A object", () => {
    expect(flatten(person)).toMatchSnapshot();
  });
  it("flatten B object with a custom root path", () => {
    expect(flatten(person, "person")).toMatchSnapshot();
  });
  it("flatten C object containing an array", () => {
    expect(flatten({ collection: ["pikachu", "drake"], name: "John" })).toMatchSnapshot();
  });

  const users = [
    { age: 21, name: "John", pic: "wow.png" },
    { age: 42, name: "Albert" },
    { age: 22, name: "Sam" },
    { age: 11, name: "Birgit" },
  ];
  it("sort byProperty A without order does not sort", () => {
    expect(users.toSorted(byProperty("name"))[0]?.name).toBe("John");
  });
  it("sort byProperty B with asc order does sort", () => {
    expect(users.toSorted(byProperty("name", "asc"))[0]?.name).toBe("Albert");
  });
  it("sort byProperty C with desc order does sort", () => {
    expect(users.toSorted(byProperty("name", "desc"))[0]?.name).toBe("Sam");
  });
  it("sort byProperty D even if some does not have it", () => {
    expect(users.toSorted(byProperty("pic", "asc"))[0]?.pic).toBe("wow.png");
  });

  const object3 = { notFun: false, "pretty-good": true, size: "large", superFun: true };
  it("class generator A undefined", () => {
    expect(genClass(undefined)).toBe("");
  });
  it("class generator B null", () => {
    expect(genClass(null)).toBe("");
  });
  it("class generator C empty string", () => {
    expect(genClass("")).toBe("");
  });
  it("class generator D string", () => {
    expect(genClass("one 2   three")).toBe("one 2 three");
  });
  it("class generator E string with cls", () => {
    expect(genClass("one 2   three", [], ["enabled", 2])).toBe("one 2 three enabled");
  });
  it("class generator F empty", () => {
    expect(genClass({})).toBe("");
  });
  it("class generator G object", () => {
    expect(genClass(object3)).toMatchInlineSnapshot('"pretty-good size-large superFun"');
  });
  it("class generator H object & specific keys", () => {
    expect(genClass(object3, ["pretty-good"])).toBe("pretty-good");
  });
  it("class generator I object & specific keys & custom class", () => {
    expect(genClass(object3, ["pretty-good"], ["nice ok"])).toBe("nice ok pretty-good");
  });
  it("class generator J object containing array", () => {
    expect(genClass({ status: ["visible", "enabled"] })).toBe("has-status");
  });
  it("class generator K object containing empty array", () => {
    expect(genClass({ status: [] })).toBe("");
  });
  it("class generator L array", () => {
    expect(genClass(["one one ", 2, null, "one", undefined, "   three "])).toBe("one 2 three");
  });

  it("isRecord A on null", () => {
    expect(isRecord(null)).toBe(false);
  });
  it("isRecord B on an array", () => {
    expect(isRecord([1, 2])).toBe(false);
  });
  it("isRecord C on an empty array", () => {
    expect(isRecord([])).toBe(false);
  });
  it("isRecord D on an empty string", () => {
    expect(isRecord("")).toBe(false);
  });
  it("isRecord E on a number", () => {
    expect(isRecord(-1)).toBe(false);
  });
  it("isRecord F on an empty record", () => {
    expect(isRecord({})).toBe(true);
  });
  it("isRecord G on a record", () => {
    expect(isRecord({ name: "John" })).toBe(true);
  });

  const object4 = { fool: { bar: "foo", regex: /^ho\d+$/iu }, keyA: 1, keyB: 2, keyC: 3 };
  const object4ButAnotherReference = { fool: { bar: "foo", regex: /^ho\d+$/iu }, keyA: 1, keyB: 2, keyC: 3 };
  const object4ButDeepRegexDifferent = { fool: { bar: "foo", regex: /^oh\d+$/iu }, keyA: 1, keyB: 2, keyC: 3 };
  it("objectSum A on empty object", () => {
    expect(objectSum({})).toMatchInlineSnapshot(`-1549353149`);
  });
  it("objectSum B is the same on two equally empty objects", () => {
    expect(objectSum({ name: "john" }) === objectSum(clone({ name: "john" }))).toBe(true);
  });
  it("objectSum C on object with numbers", () => {
    expect(objectSum({ keyA: 1, keyB: 2, keyC: 3 })).toMatchInlineSnapshot(`-1472746119`);
  });
  it("objectSum D on object with a slightly different number", () => {
    expect(objectSum({ keyA: 1, keyB: 2, keyC: 4 })).toMatchInlineSnapshot(`-411681858`);
  });
  it("objectSum E on object with a slightly different key", () => {
    expect(objectSum({ keyA: 1, keyC: 3, keyD: 2 })).toMatchInlineSnapshot("1603108510");
  });
  it("objectSum F on a large object", () => {
    expect(
      objectSum({
        abyss: 1,
        backInTime: "was a good movie",
        clearlyHugeObjectThere: 33_514_149_687,
        details: {},
        object3,
        propE: 5,
        propF: 6,
        propG: 7,
        propH: 8,
        propI: 9,
        propJ: 10,
        users,
      }),
    ).toMatchInlineSnapshot(`-876202366`);
  });

  it("objectSum G is the same on two equals objects", () => {
    expect(objectSum(object3) === objectSum(clone(object3))).toBe(true);
  });

  it("objectSum H is the same on two equals objects with nested objects", () => {
    expect(objectSum(object4) === objectSum(object4ButAnotherReference)).toBe(true);
  });

  it("objectSum I is different with a deep slight modification", () => {
    expect(objectSum(object4) !== objectSum(object4ButDeepRegexDifferent)).toBe(true);
  });

  it("objectSum J changes depending on key order", () => {
    // biome-ignore assist/source/useSortedKeys: needed
    expect(objectSum({ keyA: 1, keyB: 2, keyC: 3 }) !== objectSum({ keyC: 3, keyA: 1, keyB: 2 })).toBe(true);
  });

  it("objectSum K same when key sorted", () => {
    // biome-ignore assist/source/useSortedKeys: needed
    expect(objectSum({ keyA: 1, keyB: 2, keyC: 3 }, true) === objectSum({ keyC: 3, keyA: 1, keyB: 2 }, true)).toBe(true);
  });

  it("objectEqual A true for empty objects", () => {
    expect(objectEqual({}, {})).toBe(true);
  });

  it("objectEqual B true for objects with same keys", () => {
    expect(objectEqual({ keyA: 1, keyB: 2, keyC: 3 }, { keyA: 1, keyB: 2, keyC: 3 })).toBe(true);
  });

  it("objectEqual C false for objects with different keys", () => {
    expect(objectEqual({ keyA: 1, keyB: 2, keyC: 3 }, { keyA: 1, keyB: 2, keyD: 3 })).toBe(false);
  });
  it("objectEqual D false for objects with different values", () => {
    expect(objectEqual({ keyA: 1, keyB: 2, keyC: 3 }, { keyA: 1, keyB: 2, keyC: 4 })).toBe(false);
  });
  it("objectEqual E true with objects containing same literals", () => {
    expect(objectEqual({ bar: 2, fool: 1 }, { bar: 2, fool: 1 })).toBe(true);
  });
  it("objectEqual F true for deeply nested objects", () => {
    expect(objectEqual({ fool: { bar: "foo", regex: /^ho\d+$/iu } }, { fool: { bar: "foo", regex: /^ho\d+$/iu } })).toBe(true);
  });
  it("objectEqual H false with objects containing different literals", () => {
    expect(objectEqual({ bar: 1, fool: 1 }, { bar: 2, fool: 1 })).toBe(false);
  });
  it("objectEqual I true with same objects but different references", () => {
    expect(objectEqual(object4, object4ButAnotherReference)).toBe(true);
  });
  it("objectEqual J false with same objects but different key order", () => {
    // biome-ignore assist/source/useSortedKeys: needed
    expect(objectEqual({ keyA: 1, keyB: 2, keyC: 3 }, { keyC: 3, keyA: 1, keyB: 2 })).toBe(false);
  });
  it("objectEqual K true with same objects, different key order but key sort is active", () => {
    // biome-ignore assist/source/useSortedKeys: needed
    expect(objectEqual({ keyA: 1, keyB: 2, keyC: 3 }, { keyC: 3, keyA: 1, keyB: 2 }, true)).toBe(true);
  });

  it("objectSort A sort a simple object", () => {
    // biome-ignore assist/source/useSortedKeys: needed
    const object = { keyC: 3, keyA: 1, keyB: 2 };
    const sorted = objectSort(object);
    // we cannot use toStrictEqual because toStrictEqual does not check the order of the keys, objectEqual does
    expect(objectEqual(sorted, { keyA: 1, keyB: 2, keyC: 3 })).toBe(true);
  });

  it("objectSort B sort a 2 level object", () => {
    // biome-ignore assist/source/useSortedKeys: needed
    const object = { keyC: 3, keyA: 1, alpaca: { c3: 33, c1: 11, c2: 22 }, keyB: 2 };
    const sorted = objectSort(object);
    expect(objectEqual(sorted, { alpaca: { c1: 11, c2: 22, c3: 33 }, keyA: 1, keyB: 2, keyC: 3 })).toBe(true);
  });

  it("objectSort C sort a complex object with null, undefined, etc", () => {
    // biome-ignore assist/source/useSortedKeys: needed
    const alpaca = { c3: 33, c1: 11, c4: undefined, c2: 22 };
    // biome-ignore assist/source/useSortedKeys: needed
    const names = ["john", null, [{ c3: 3, b2: 2 }], "eddy"];
    // biome-ignore assist/source/useSortedKeys: needed
    const zebra = { z3: 33, z1: 11, z2: null };
    // biome-ignore assist/source/useSortedKeys: needed
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
});
