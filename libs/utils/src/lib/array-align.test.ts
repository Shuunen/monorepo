import { arrayAlign } from "./array-align.js";

describe("array-align", () => {
  it("arrayAlign A common use case : values shorter than targetLength", () => {
    const result = arrayAlign([1, 2], 4);
    expect(result).toEqual([1, 2, undefined, undefined]);
  });
  it("arrayAlign B common use case : values longer than targetLength", () => {
    const result = arrayAlign([1, 2, 3, 4, 5], 3);
    expect(result).toEqual([1, 2, 3]);
  });
  it("arrayAlign C values undefined, targetLength defined", () => {
    const result = arrayAlign(undefined, 3);
    expect(result).toEqual([undefined, undefined, undefined]);
  });
  it("arrayAlign D values defined, targetLength undefined", () => {
    const result = arrayAlign([1, 2, 3]);
    expect(result).toEqual([1, 2, 3]);
  });
  it("arrayAlign E both values and targetLength undefined", () => {
    const result = arrayAlign();
    expect(result).toEqual([undefined]);
  });
  it("arrayAlign F values defined, targetLength defined to the same length", () => {
    const result = arrayAlign([1, 2, 3], 3);
    expect(result).toEqual([1, 2, 3]);
  });
});
