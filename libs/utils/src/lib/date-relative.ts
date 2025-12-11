import { nbMsInDay, nbMsInHour, nbMsInMinute, nbMsInMonth, nbMsInSecond, nbMsInWeek, nbMsInYear } from "./constants.js";
import { dateIso10 } from "./dates.js";

const timeAgoTuples = [
  [nbMsInMinute, nbMsInSecond, "second"],
  [nbMsInHour, nbMsInMinute, "minute"],
  [nbMsInDay, nbMsInHour, "hour"],
  [nbMsInWeek, nbMsInDay, "day"],
  [nbMsInMonth, nbMsInWeek, "week"],
  [nbMsInYear, nbMsInMonth, "month"],
] as const;

/**
 * Make a date readable for us, poor humans
 * Kudos to https://coolaj86.com/articles/time-ago-in-under-50-lines-of-javascript/
 * @param input a date or a number of milliseconds
 * @param language the language to use, default is "en"
 * @returns "a minute ago", "4 days ago"
 */
export function readableTimeAgo(input: number | Readonly<Date>, language = "en") {
  const rtf = new Intl.RelativeTimeFormat(language, { numeric: "auto" });
  const ms = typeof input === "number" ? input : Date.now() - input.getTime();
  for (const [threshold, divisor, unit] of timeAgoTuples) {
    if (ms < threshold) {
      return rtf.format(-Math.floor(ms / divisor), unit);
    }
  }
  return rtf.format(-Math.floor(ms / nbMsInYear), "year");
}

/**
 * Return a relative Date
 * @param nbDays the number of days to subtract from today
 * @returns a Date
 */
export function daysAgo(nbDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() - nbDays);
  return date;
}

/**
 * Return a relative Date in the future
 * @param nbDays the number of days to add to today
 * @returns a Date
 * @example daysFromNow(1) // tomorrow
 */
export function daysFromNow(nbDays = 0) {
  return daysAgo(-nbDays);
}

/**
 * Return a relative date formatted to ISO 10
 * @param nbDays the number of days to subtract from today
 * @returns a string like : "2019-12-31"
 */
export function daysAgoIso10(nbDays = 0) {
  return dateIso10(daysAgo(nbDays));
}
