import { expect, it } from "vitest";
import { stuffToMessage } from "./logger.utils";

it("stuffToMessage A", () => {
  const result = stuffToMessage("a", "b", "c");
  expect(result).toBe("a, b, c");
});

it("stuffToMessage B", () => {
  const result = stuffToMessage("a", "b", { cat: "d" });
  expect(result).toMatchInlineSnapshot('"a, b, {"cat":"d"}"');
});

it("stuffToMessage C", () => {
  const result = stuffToMessage("a", "b", { cat: "dog" }, 1, 2, 3);
  expect(result).toMatchInlineSnapshot('"a, b, {"cat":"dog"}, 1, 2, 3"');
});
