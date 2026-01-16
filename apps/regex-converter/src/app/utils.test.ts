import { describe, expect, it } from "vitest";
import { applyRules } from "./utils";

describe("utils", () => {
  it("applyRules A should apply enabled rules in order", () => {
    const result = applyRules("foo. right bar.", [
      { enabled: true, id: "1", pattern: "\\.", replacement: "🐱" },
      { enabled: true, id: "2", pattern: "right", replacement: "" },
    ]);
    expect(result).toMatchInlineSnapshot('"foo🐱  bar🐱"');
  });

  it("applyRules B should skip disabled rules", () => {
    const result = applyRules("foo.", [
      { enabled: false, id: "3", pattern: "foo", replacement: "bar" },
      { enabled: true, id: "4", pattern: "\\.", replacement: "🐱" },
    ]);
    expect(result).toMatchInlineSnapshot('"foo🐱"');
  });

  it("applyRules C should handle invalid regex gracefully", () => {
    const result = applyRules("foo", [{ enabled: true, id: "5", pattern: "[", replacement: "x" }]);
    expect(result).toMatchInlineSnapshot('"foo"');
  });
});
