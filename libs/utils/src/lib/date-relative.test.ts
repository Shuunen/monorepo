import { daysAgo, daysAgoIso10, daysFromNow, readableTimeAgo } from "./date-relative.js";
import { dateIso10 } from "./date-iso.js";

describe("date-relative", () => {
  it("daysFromNow A without param", () => {
    expect(daysFromNow().toISOString()).toContain(dateIso10());
  });

  it("daysAgoIso10 give today by default", () => {
    expect(daysAgoIso10()).toBe(dateIso10(new Date()));
  });

  const samples = [
    [1000, "1 second ago"],
    [2500, "2 seconds ago"],
    [0, "now"],
    [daysAgo(), "now"],
    [10 * 1000, "10 seconds ago"],
    [59 * 1000, "59 seconds ago"],
    [60 * 1000, "1 minute ago"],
    [61 * 1000, "1 minute ago"],
    [119 * 1000, "1 minute ago"],
    [120 * 1000, "2 minutes ago"],
    [121 * 1000, "2 minutes ago"],
    [60 ** 2 * 1000 - 1000, "59 minutes ago"],
    [1 * 60 * 60 * 1000, "1 hour ago"],
    [1.5 * 60 * 60 * 1000, "1 hour ago"],
    [2.5 * 60 * 60 * 1000, "2 hours ago"],
    [daysAgo(1), "yesterday"],
    [daysAgo(2), "2 days ago"],
    [daysAgo(8), "last week"],
    [daysAgo(15), "2 weeks ago"],
    [daysAgo(29), "4 weeks ago"],
    [daysAgo(35), "last month"],
    [daysAgo(61), "2 months ago"],
    [daysAgo(364), "12 months ago"],
    [daysAgo(365), "last year"],
  ] as const;

  for (const [index, [input, expected]] of samples.entries()) {
    it(`readableTimeAgo should calculate time ago correctly (index ${index})`, () => {
      expect(readableTimeAgo(input)).toBe(expected);
    });
  }
});
