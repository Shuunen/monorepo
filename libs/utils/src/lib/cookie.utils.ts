import { Logger } from "./logger.js";

export async function getCookieValueByName(name: string): Promise<string | undefined> {
  // CookieStore is available - in more recent browser versions
  if (typeof globalThis !== "undefined" && "cookieStore" in globalThis) {
    try {
      const cookie = await globalThis.cookieStore.get(name);
      if (cookie) {
        return cookie.value;
      }
    } catch (error) {
      /* v8 ignore start */
      const logger = new Logger();
      logger.showError(error);
      /* v8 ignore stop */
    }
  }
  // Fallback: parse document.cookie if cookieStore is not present - like in older versions of Firefox
  const cookies = globalThis.document.cookie.split(";");
  for (const cookie of cookies) {
    const trimmedCookie = cookie.trim();
    const separatorIndex = trimmedCookie.indexOf("=");

    /* v8 ignore start */
    if (separatorIndex === -1) {
      continue;
    }
    const key = trimmedCookie.slice(0, separatorIndex);
    const value = trimmedCookie.slice(separatorIndex + 1);
    if (key === name) {
      return decodeURIComponent(value);
    }
    /* v8 ignore stop */
  }
  return undefined;
}
