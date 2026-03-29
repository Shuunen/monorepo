import { nbMsInDay, nbMsInMonth, nbMsInWeek, nbMsInYear } from "./constants.js";
import { dateIso10 } from "./date-iso.js";
import { daysAgo, daysAgoIso10, daysFromNow, readableTimeAgo } from "./date-relative.js";

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
    [nbMsInDay, "yesterday"],
    [2 * nbMsInDay, "2 days ago"],
    [1.1 * nbMsInWeek, "last week"],
    [2.1 * nbMsInWeek, "2 weeks ago"],
    [4.1 * nbMsInWeek, "4 weeks ago"],
    [1.1 * nbMsInMonth, "last month"],
    [2.1 * nbMsInMonth, "2 months ago"],
    [12 * nbMsInMonth, "12 months ago"],
    [nbMsInYear, "last year"],
  ] as const;

  for (const [index, [input, expected]] of samples.entries()) {
    it(`readableTimeAgo should calculate time ago correctly (index ${index})`, () => {
      expect(readableTimeAgo(input)).toBe(expected);
    });
  }
});
