import { parseJson } from "./json.js";
import { Result } from "./result.js";

/**
 * Encode a string to base64
 * @param str String to encode
 * @returns Base64 encoded string
 */
export function toBase64(str: string) {
  // oxlint-disable-next-line id-length
  return globalThis.btoa(encodeURIComponent(str).replaceAll(/%([0-9A-F]{2})/g, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16))));
}

/**
 * Convert a base64 character to percent-encoded string for URI decoding
 * @param char Single character from base64-decoded string
 * @returns Percent-encoded string
 */
function base64CharToPercentEncoded(char: string) {
  const hexRadix = 16;
  const padLength = 2;
  const code = char.codePointAt(0);
  /* v8 ignore next -- @preserve */
  if (code === undefined) {
    return "";
  }
  return `%${code.toString(hexRadix).padStart(padLength, "0")}`;
}

/**
 * Decode a base64 encoded string
 * @param b64 Base64 encoded string
 * @returns Decoded string
 */
export function fromBase64(b64: string) {
  const result = Result.trySafe(() =>
    decodeURIComponent(
      Array.from(globalThis.atob(b64))
        // oxlint-disable-next-line max-nested-callbacks
        .map(char => base64CharToPercentEncoded(char))
        .join(""),
    ),
  );
  return result.ok ? result.value : "";
}

/**
 * Encode data to be safely included in a URL for example as a query parameter or as storage
 * @param data Data to encode
 * @returns Encoded data
 */
export function encodeForUrl(data: unknown) {
  return encodeURIComponent(toBase64(JSON.stringify(data)));
}

/**
 * Decode data from a URL
 * @param str Encoded data found in a URL
 * @returns Decoded data or empty string if decoding or parsing failed
 */
export function decodeFromUrl(str: string) {
  const b64 = decodeURIComponent(str);
  const decoded = fromBase64(b64);
  const result = parseJson(decoded);
  return result.ok ? result.value : "";
}
