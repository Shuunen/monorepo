import { fillTemplate } from "./string-template.js";

describe("string-template", () => {
  const data = {
    details: {
      pinCode: 3544,
    },
    // biome-ignore lint/style/useNamingConvention: for testing purposes
    key_ToHappiness: "Roo-doo-doot-da-doo",
    name: "Wick",
    quote: "Bears. Beets. Battlestar Galactica.",
  };
  // biome-ignore lint/style/useNamingConvention: for testing purposes
  const objectIn = { Andy: "{{ key_ToHappiness }} !" };

  it("fillTemplate A template string without mustaches and data", () => {
    expect(fillTemplate(data.quote)).toBe(data.quote);
  });
  it("fillTemplate B an empty template string", () => {
    expect(fillTemplate("")).toBe("");
  });
  it("fillTemplate C an empty template string with data", () => {
    expect(fillTemplate("", data)).toBe("");
  });
  it("fillTemplate D a template string with data", () => {
    expect(fillTemplate("John {name}", data)).toBe("John Wick");
  });
  it("fillTemplate E a template string with long key data", () => {
    expect(fillTemplate("Andy : {{ key_ToHappiness }} !", data)).toMatchInlineSnapshot(`"Andy : Roo-doo-doot-da-doo !"`);
  });
  it("fillTemplate F a template string with unknown key", () => {
    expect(fillTemplate("John {unknown_key}", data)).toBe("John {unknown_key}");
  });
  it("fillTemplate G a template object with data", () => {
    expect(fillTemplate(objectIn, data)).toMatchInlineSnapshot(`
      "{
        "Andy": "Roo-doo-doot-da-doo !"
      }"
    `);
  });
  it("fillTemplate H a template string with deep data", () => {
    expect(fillTemplate("My code is {{details.pinCode}}", data)).toBe("My code is 3544");
  });
  it("fillTemplate I a template string with missing data", () => {
    expect(fillTemplate("J’aime les {membre}", {})).toBe("J’aime les {membre}");
  });
});
