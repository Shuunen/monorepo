import { getTimestamp, getTimestampMs } from "./timestamps.js";

it("specific date", () => {
  expect(getTimestamp(new Date("1989-05-14"))).toBe(611_107_200);
});

it("give positive number", () => {
  expect(getTimestamp() > 0).toBe(true);
});

it("give date before year 3003", () => {
  expect(getTimestamp() < 32_603_558_400_000).toBe(true);
});

it("ms of a specific date", () => {
  expect(getTimestampMs(new Date("1989-05-14"))).toBe(611_107_200_000);
});

const sizeMs = getTimestampMs().toString().length;
const sizeS = getTimestamp().toString().length;
it("ms is a 1000 times bigger", () => {
  expect(sizeMs - sizeS === 3).toBe(true);
});
