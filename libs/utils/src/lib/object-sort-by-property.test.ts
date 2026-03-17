import { byProperty } from "./object-sort-by-property.js";

describe(byProperty, () => {
  const users = [
    { age: 21, name: "John", pic: "wow.png" },
    { age: 42, name: "Albert" },
    { age: 22, name: "Sam" },
    { age: 11, name: "Birgit" },
  ];
  it("byProperty A without order does not sort", () => {
    expect(users.toSorted(byProperty("name"))[0]?.name).toBe("John");
  });
  it("byProperty B with asc order does sort", () => {
    expect(users.toSorted(byProperty("name", "asc"))[0]?.name).toBe("Albert");
  });
  it("byProperty C with desc order does sort", () => {
    expect(users.toSorted(byProperty("name", "desc"))[0]?.name).toBe("Sam");
  });
  it("byProperty D even if some does not have it", () => {
    expect(users.toSorted(byProperty("pic", "asc"))[0]?.pic).toBe("wow.png");
  });

  it("byProperty E with desc when some does not have the property", () => {
    const sorted = users.toSorted(byProperty("pic", "desc"));
    expect(sorted.map(user => user.name)).toMatchInlineSnapshot(`
      [
        "Albert",
        "Sam",
        "Birgit",
        "John",
      ]
    `);
  });

  it("byProperty F with asc when first has property but second does not", () => {
    const items = [{ name: "A", value: 10 }, { name: "B" }];
    const sorted = items.toSorted(byProperty("value", "asc"));
    expect(sorted[0]?.name).toBe("A");
  });

  it("byProperty G with desc when first has property but second does not", () => {
    const items = [{ name: "A", value: 10 }, { name: "B" }, { name: "C", value: 5 }];
    const sorted = items.toSorted(byProperty("value", "desc"));
    expect(sorted.map(item => item.name)).toMatchInlineSnapshot(`
      [
        "B",
        "A",
        "C",
      ]
    `);
  });

  it("byProperty H comparator when first has property and second does not", () => {
    const comparator = byProperty<{ name: string; value?: number }>("value", "asc");
    const itemA = { name: "A", value: 10 };
    const itemB = { name: "B" };
    const result = comparator(itemA, itemB);
    expect(result).toBeLessThan(0);
  });
});
