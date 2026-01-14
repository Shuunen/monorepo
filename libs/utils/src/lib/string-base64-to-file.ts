import { Result } from "./result.js";

const mimeTypeRegex = /:(?<mimeType>[^;]+);/; // NOSONAR

/**
 * Convert a base64 string to a `File` instance.
 *
 * @param base64 the base64 string
 * @param filename the output filename
 * @returns the base64 string
 */
// oxlint-disable-next-line max-statements
export function base64ToFile(base64: string, filename: string) {
  // Strip off the data URL prefix if present.
  const [dataUrlPrefix, base64String] = base64.split(",");
  // Decode Base64 to binary string.
  const base64BinaryResult = Result.trySafe(() => atob(base64String));
  if (!base64BinaryResult.ok) {
    return Result.error("Failed to encode base64 string.");
  }

  const uint8Arr = new Uint8Array(base64BinaryResult.value.length);

  // Convert binary string to Uint8Array.
  for (let index = 0; index < base64BinaryResult.value.length; index += 1) {
    uint8Arr[index] = base64BinaryResult.value.codePointAt(index) as number;
  }

  /* c8 ignore start */
  const mimeType = mimeTypeRegex.exec(dataUrlPrefix)?.groups?.mimeType;
  if (!mimeType) {
    return Result.error("No mime type found.");
  }

  // Create a Blob from the Uint8Array and return the File object.
  const blob = new Blob([uint8Arr], { type: mimeType });
  const extension = mimeType.split("/")[1];
  if (!extension) {
    return Result.error("No extension found.");
  }
  /* c8 ignore stop */

  const file = new File([blob], `${filename}.${extension}`, { type: mimeType });

  return Result.ok(file);
}
