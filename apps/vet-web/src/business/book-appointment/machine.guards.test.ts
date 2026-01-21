import { isCat } from "./machine.guards";

describe("book-appointment machine guards", () => {
  it("isCat A guard returns true for cat breed", () => {
    const result = isCat({ formData: { breed: "cat" } });
    expect(result).toBe(true);
  });
  it("isCat B guard returns false for dog breed", () => {
    const result = isCat({ formData: { breed: "dog" } });
    expect(result).toBe(false);
  });
  it("isCat C guard returns false for undefined breed", () => {
    const result = isCat({ formData: { breed: undefined } });
    expect(result).toBe(false);
  });
});
