import { describe, expect, it } from "vitest";
import { componentRegistry } from "./auto-form-field.utils";

describe("auto-form-field.utils", () => {
  it("should have componentRegistry defined", () => {
    expect(componentRegistry).toBeDefined();
    expect(Object.keys(componentRegistry).length).toMatchInlineSnapshot(`13`);
  });
});
