import { nbMsInDay, nbMsInHour, nbMsInMinute, nbMsInMonth, nbMsInSecond, nbMsInYear } from "./constants.js";

/**
 * Make a date readable for us, poor humans
 * @param input a date or a number of milliseconds
 * @param isLong true to return a short version like "3d" instead of "3 days"
 * @returns "1 minute", "4 months" or "1min", "4mon"
 * @example readableTime(3 * nbMsInDay) // "3 days"
 * @example readableTime(3 * nbMsInDay, false) // "3d"
 */
// oxlint-disable-next-line max-lines-per-function
export function readableTime(input: number | Readonly<Date>, isLong = true) {
  /* v8 ignore next -- @preserve */
  const ms = typeof input === "number" ? input : Date.now() - input.getTime();
  const format = (value: number, long: string, short: string) => {
    const floor = Math.floor(value);
    const plural = floor > 1 ? "s" : "";
    const longPlural = ` ${long + plural}`;
    return `${floor}${isLong ? longPlural : short}`;
  };
  if (ms < nbMsInSecond) {
    return format(ms, "millisecond", "ms");
  }
  if (ms < nbMsInMinute) {
    return format(ms / nbMsInSecond, "second", "s");
  }
  if (ms < nbMsInHour) {
    return format(ms / nbMsInMinute, "minute", "min");
  }
  if (ms < nbMsInDay) {
    return format(ms / nbMsInHour, "hour", "h");
  }
  if (ms < nbMsInMonth) {
    return format(ms / nbMsInDay, "day", "d");
  }
  if (ms < nbMsInYear) {
    return format(ms / nbMsInMonth, "month", "mon");
  }
  return format(ms / nbMsInYear, "year", "y");
}
