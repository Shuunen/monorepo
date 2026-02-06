/**
 * Format a date to a specific format
 * @param date input date
 * @param format the format to use like : "yyyy-MM-dd" or "dd/MM/yyyy HH:mm:ss"
 * @param locale the locale to use, default is en-US
 * @returns a string like : "2018-09-03"
 */
export function formatDate(date: Readonly<Date>, format: string, locale = "en-US") {
  // oxlint-disable max-statements
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: cant be simplified ^^
  return format.replaceAll(/y{4}|yy|M{4}|MM|dd|d|e{4}|e{3}|HH|mm|ss|\s/gu, match => {
    if (match === "yyyy") {
      return date.toLocaleDateString(locale, { year: "numeric" });
    }
    if (match === "yy") {
      return date.toLocaleDateString(locale, { year: "2-digit" });
    }
    if (match === "MMMM") {
      return date.toLocaleDateString(locale, { month: "long" });
    }
    if (match === "MM") {
      return date.toLocaleDateString(locale, { month: "2-digit" });
    }
    if (match === "dd") {
      return date.toLocaleDateString(locale, { day: "2-digit" });
    }
    if (match === "d") {
      return date.toLocaleDateString(locale, { day: "numeric" });
    }
    if (match === "eeee") {
      return date.toLocaleDateString(locale, { weekday: "long" });
    }
    if (match === "eee") {
      return date.toLocaleDateString(locale, { weekday: "short" });
    }
    if (match === "HH") {
      return date.getHours().toString().padStart(match.length, "0");
    }
    if (match === "mm") {
      return date.getMinutes().toString().padStart(match.length, "0");
    }
    if (match === "ss") {
      return date.getSeconds().toString().padStart(match.length, "0");
    }
    return match;
  });
}
