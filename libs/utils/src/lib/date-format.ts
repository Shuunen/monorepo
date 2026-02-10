const formatRegex = /y{4}|yy|M{4}|MM|dd|d|e{4}|e{3}|HH|mm|ss|\s/gu;

const formatTokens: Record<string, Intl.DateTimeFormatOptions> = {
  // biome-ignore lint/style/useNamingConvention: we need to match commonly used tokens
  MM: { month: "2-digit" },
  // biome-ignore lint/style/useNamingConvention: we need to match commonly used tokens
  MMMM: { month: "long" },
  d: { day: "numeric" }, // oxlint-disable-line id-length
  dd: { day: "2-digit" },
  eee: { weekday: "short" },
  eeee: { weekday: "long" },
  yy: { year: "2-digit" },
  yyyy: { year: "numeric" },
};

const timeTokens: Record<string, (date: Date) => number> = {
  // biome-ignore lint/style/useNamingConvention: we need to match commonly used tokens
  HH: date => date.getHours(),
  mm: date => date.getMinutes(),
  ss: date => date.getSeconds(),
};

/**
 * Format a date to a specific format
 * @param date input date
 * @param format the format to use like : "yyyy-MM-dd" or "dd/MM/yyyy HH:mm:ss"
 * @param locale the locale to use, default is en-US
 * @returns a string like : "2018-09-03"
 */
export function formatDate(date: Readonly<Date>, format: string, locale = "en-US") {
  return format.replaceAll(formatRegex, match => {
    const dateOption = formatTokens[match];
    if (dateOption) {
      return date.toLocaleDateString(locale, dateOption);
    }
    const timeGetter = timeTokens[match];
    if (timeGetter) {
      return timeGetter(date).toString().padStart(match.length, "0");
    }
    return match;
  });
}
