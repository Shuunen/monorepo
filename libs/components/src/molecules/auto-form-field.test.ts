import { describe, expect, it } from "vitest";

describe("auto-form-field.utils", () => {
  it("should have componentRegistry defined", async () => {
    const { componentRegistry } = await import("./auto-form-field.utils");
    expect(componentRegistry).toBeDefined();
    expect(Object.keys(componentRegistry).length).toMatchInlineSnapshot(`10`);
  });
});
