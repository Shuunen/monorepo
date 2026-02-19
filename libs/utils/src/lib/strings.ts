import { nbNinth } from "./constants.js";
import { removeAccents } from "./string-remove-accents.js";

/**
 * Clean a string from special characters
 * @param sentence like "Hello, my name is John Doe !"
 * @param willLower lowercase the output
 * @returns cleaned string like "Hello my name is John Doe"
 */
export function sanitize(sentence: string, willLower = true) {
  const text = removeAccents(sentence)
    .trim() // remove leading and trailing spaces
    .replaceAll(/<[^<>]*>/gu, " ") // remove any tags
    .replaceAll(/[/'’.-]/gu, " ") // replace separators with spaces
    .replaceAll(/[^\d\sa-z]/giu, "") // remove remaining non-alphanumeric characters
    .replaceAll(/\s+/gu, " ") // replace multiple spaces with one
    .trim(); // final trim
  return willLower ? text.toLowerCase() : text;
}

/**
 * Slugify a string
 * @param string The input string, e.g. "Slug % ME with // Love !"
 * @returns The slugified string, e.g. "slug-me-with-love"
 */
export function slugify(string: string) {
  return (
    sanitize(string) // Clean the string
      .replaceAll(/\W+/giu, "-") // Replace all non word with dash
      // biome-ignore lint/performance/useTopLevelRegex: it's fine
      .replace(/^-*/u, "") // Trim dash from start
      // biome-ignore lint/performance/useTopLevelRegex: it's fine
      .replace(/-$/u, "") // Trim dash from end
  );
}

/**
 * Transform the first letter of a string into capital
 * @param string `"hello John"`
 * @param shouldLower boolean, try to lower the rest of the string when applicable
 * @returns `"Hello John"`
 */
export function capitalize(string: string, shouldLower = false) {
  if (!shouldLower) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

/**
 * Ellipsis after a specific amount of words
 * @param stringIn `"Hello my dear friend"`
 * @param maxWords 3 for example
 * @returns `"Hello my dear..."`
 */
export function ellipsisWords(stringIn = "", maxWords = 5) {
  const stringOut = stringIn.split(" ").splice(0, maxWords).join(" ");
  if (stringOut === stringIn) {
    return stringIn;
  }
  return `${stringOut}...`;
}

/**
 * Ellipsis after a specific amount of characters
 * @param stringIn `"Hello my dear friend"`
 * @param maxLength 8 for example
 * @returns `"Hello my..."`
 */
export function ellipsis(stringIn = "", maxLength = 50) {
  const stringOut = stringIn.slice(0, maxLength);
  if (stringOut === stringIn) {
    return stringIn;
  }
  return `${stringOut}...`;
}

/**
 * Create a CRC32 table
 * @param length the length of the table
 * @returns a table of 256 numbers
 */
export function createCrc32Table(length = 256) {
  const table: number[] = Array.from({ length });
  for (let index = 0; index < length; index += 1) {
    let code = index;
    for (let indexB = 0; indexB < nbNinth; indexB += 1) {
      // oxlint-disable-next-line no-bitwise, no-magic-numbers
      code = code & 0x01 ? 3_988_292_384 ^ (code >>> 1) : code >>> 1;
    }
    table[index] = code;
  }
  return table;
}

/**
 * Generate a CRC32 checksum for a given string
 * https://dirask.com/posts/TypeScript-calculate-crc32-p2ZBKp
 * @param text the string to checksum
 * @returns the checksum like `3547`
 */
export function crc32(text: string) {
  const crcTable = createCrc32Table();
  let crc = -1;
  for (let index = 0; index < text.length; index += 1) {
    const code = /* c8 ignore next */ text.codePointAt(index) ?? 0;
    // oxlint-disable no-bitwise, no-magic-numbers
    const key: number = (code ^ crc) & 0xff;
    const value: number | undefined = crcTable[key];
    /* c8 ignore start */
    if (value !== undefined && value !== 0) {
      /* c8 ignore stop */
      crc = value ^ (crc >>> 8);
    }
  }
  return Math.trunc(-1 ^ crc);
  // oxlint-enable no-bitwise, no-magic-numbers
}

/**
 * Generate a checksum for a given string
 * @param string `"Hello my dear friend"`
 * @returns the checksum like `3547`
 */
export function stringSum(string: string) {
  return crc32(string);
}

/**
 * Check if the value is a string
 * @param value the value to check
 * @returns true if the value is a string
 */
export function isString(value: unknown) {
  return typeof value === "string";
}
