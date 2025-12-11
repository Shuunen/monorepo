import { getNested, setNested } from "./object-deep.js";

const person = {
  details: {
    address: {
      city: "Tokyo",
      country: "Japan",
    },
    favoriteFood: "sushi",
  },
  name: "John Doe",
};

describe("object-deep", () => {
  // getNested
  it("getNested A nested existing property getNested", () => {
    expect(getNested(person, "details.favoriteFood")).toBe("sushi");
  });
  it("getNested B nested non-existing property getNested", () => {
    expect(typeof getNested(person, "details.favoriteDrink")).toBe("undefined");
  });
  it("getNested C non-nested property", () => {
    expect(getNested({ name: "John Cena" }, "name")).toBe("John Cena");
  });
  it("getNested D non-existing non-nested property", () => {
    expect(typeof getNested({ name: "John Cena" }, "age")).toBe("undefined");
  });
  it("getNested E non-nested property after an undefined property", () => {
    expect(getNested({ age: undefined, name: "John Cena" }, "name")).toBe("John Cena");
  });
  it("getNested F should handle array path", () => {
    expect(getNested(person, ["details", "address", "city"])).toBe("Tokyo");
  });
  it("getNested G should return default value when path does not exist", () => {
    expect(getNested(person, "details.favoriteDrink", "water")).toBe("water");
  });
  it("getNested H should return default value with array path when not found", () => {
    expect(getNested(person, ["details", "favoriteColor"], "blue")).toBe("blue");
  });
  it("getNested I should return default value when property exists but is undefined", () => {
    expect(getNested({ value: undefined }, "value", "default")).toBe("default");
  });
  it("getNested J should return found value even when default is provided", () => {
    expect(getNested(person, "name", "default name")).toBe("John Doe");
  });
  it("getNested K should return default value when object is undefined", () => {
    expect(getNested(undefined, "any.path", "fallback")).toBe("fallback");
  });
  // setNested
  it("setNested A should set a simple property", () => {
    const obj = {};
    setNested(obj, "name", "Alice");
    expect(obj).toMatchInlineSnapshot(`
      {
        "name": "Alice",
      }
    `);
  });
  it("setNested B should set a nested property with string path", () => {
    const obj = {};
    setNested(obj, "user.name", "Bob");
    expect(obj).toMatchInlineSnapshot(`
      {
        "user": {
          "name": "Bob",
        },
      }
    `);
  });
  it("setNested C should set a deeply nested property", () => {
    const obj = {};
    setNested(obj, "user.profile.address.city", "Paris");
    expect(obj).toMatchInlineSnapshot(`
      {
        "user": {
          "profile": {
            "address": {
              "city": "Paris",
            },
          },
        },
      }
    `);
  });
  it("setNested D should set property using array path", () => {
    const obj = {};
    setNested(obj, ["data", "items", "first"], "value1");
    expect(obj).toMatchInlineSnapshot(`
      {
        "data": {
          "items": {
            "first": "value1",
          },
        },
      }
    `);
  });
  it("setNested E should override existing property", () => {
    const obj = { name: "Old Name" };
    setNested(obj, "name", "New Name");
    expect(obj).toMatchInlineSnapshot(`
      {
        "name": "New Name",
      }
    `);
  });
  it("setNested F should set property in existing nested structure", () => {
    const obj = { user: { age: 30 } };
    setNested(obj, "user.name", "Charlie");
    expect(obj).toMatchInlineSnapshot(`
      {
        "user": {
          "age": 30,
          "name": "Charlie",
        },
      }
    `);
  });
  it("setNested G should set array element by index", () => {
    const obj: { items?: unknown[] } = {};
    setNested(obj, "items.0", "first");
    setNested(obj, "items.1", "second");
    expect(obj).toMatchInlineSnapshot(`
      {
        "items": [
          "first",
          "second",
        ],
      }
    `);
  });
  it("setNested H should handle setting undefined value", () => {
    const obj = {};
    setNested(obj, "data.value", undefined);
    expect(obj).toMatchInlineSnapshot(`
      {
        "data": {
          "value": undefined,
        },
      }
    `);
  });
  it("setNested I should handle setting null value", () => {
    const obj = {};
    setNested(obj, "data.value", null);
    expect(obj).toMatchInlineSnapshot(`
      {
        "data": {
          "value": null,
        },
      }
    `);
  });
});
