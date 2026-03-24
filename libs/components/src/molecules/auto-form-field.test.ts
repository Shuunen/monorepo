import { z } from "zod";
import { componentRegistry, isFieldOptional } from "./auto-form-field.utils";

describe("auto-form-field.utils", () => {
  it("should have componentRegistry defined", () => {
    expect(componentRegistry).toBeDefined();
    expect(Object.keys(componentRegistry).length).toMatchInlineSnapshot(`14`);
  });

  describe(isFieldOptional, () => {
    it("A should return true for optional schema", () => {
      const schema = z.string().optional();
      expect(isFieldOptional(schema)).toBe(true);
    });
    it("B should return true for optional schema with prefault", () => {
      const schema = z.string().optional().prefault("");
      expect(isFieldOptional(schema)).toBe(true);
    });
    it("C should return true for optional schema with default", () => {
      const schema = z.string().optional().default("");
      expect(isFieldOptional(schema)).toBe(true);
    });
    it("D should return true for default schema with optional", () => {
      const schema = z.string().default("").optional();
      expect(isFieldOptional(schema)).toBe(true);
    });
    it("E should return true for prefault schema with optional", () => {
      const schema = z.string().prefault("").optional();
      expect(isFieldOptional(schema)).toBe(true);
    });
    it("F should return false for non optional schema", () => {
      const schema = z.string();
      expect(isFieldOptional(schema)).toBe(false);
    });
    it("G should return false for non optional default schema", () => {
      const schema = z.string().default("");
      expect(isFieldOptional(schema)).toBe(false);
    });
    it("H should return false for non optional prefault schema", () => {
      const schema = z.string().prefault("");
      expect(isFieldOptional(schema)).toBe(false);
    });
  });
});
