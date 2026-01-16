import { hoursInDay, msInSecond, secondsInHour } from "./date.const";

export function isOlderThan(date: Date, days: number): boolean {
  const now = new Date();
  const timeDiff = now.getTime() - date.getTime();
  const dayDiff = timeDiff / (msInSecond * secondsInHour * hoursInDay);
  return dayDiff > days;
}
