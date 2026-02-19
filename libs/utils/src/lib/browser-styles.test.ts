import { cn } from "./browser-styles.js";

describe("browser-styles", () => {
  it("cn A", () => {
    expect(cn("a", "b", "c")).toMatchInlineSnapshot(`"a b c"`);
  });

  it("cn B", () => {
    expect(cn("a", null, "b", "c", undefined)).toMatchInlineSnapshot(`"a b c"`);
  });

  it("cn C empty input", () => {
    expect(cn([])).toBe("");
  });

  it("cn D simple classes", () => {
    expect(cn("bg-blue text-black", "text-red font-bold")).toMatchInlineSnapshot(`"bg-blue text-red font-bold"`);
  });

  it("cn E merge classes", () => {
    expect(cn("bg-blue bg-blue bg-blue text-black", "text-red font-bold")).toMatchInlineSnapshot(
      `"bg-blue text-red font-bold"`,
    );
  });
});
