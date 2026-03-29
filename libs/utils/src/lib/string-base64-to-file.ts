import { Result } from "./result.js";

const mimeTypeRegex = /:(?<mimeType>[^;]+);/; // NOSONAR

/**
 * Convert a base64 string to a `File` instance.
 *
 * @param base64 the base64 string
 * @param filename the output filename with extension
 * @param checkExtension if false, does not check if the filename contains extension
 * @returns the base64 string
 */
export function base64ToFile(base64: string, filename: string, checkExtension = true) {
  // Strip off the data URL prefix if present.
  const [dataUrlPrefix, base64String] = base64.split(",");
  if (dataUrlPrefix === undefined || base64String === undefined) {
    return Result.error("Invalid base64 string format.");
  }
  // Decode Base64 to binary string.
  /* v8 ignore start */
  const base64BinaryResult = Result.trySafe(() => atob(base64String));
  if (!base64BinaryResult.ok) {
    return Result.error("Failed to decode base64 string.");
  }
  /* v8 ignore stop */

  const uint8Arr = new Uint8Array(base64BinaryResult.value.length);

  // Convert binary string to Uint8Array.
  for (let index = 0; index < base64BinaryResult.value.length; index += 1) {
    // oxlint-disable-next-line typescript/no-non-null-assertion
    uint8Arr[index] = base64BinaryResult.value.codePointAt(index)!;
  }

  /* v8 ignore start */
  const mimeType = mimeTypeRegex.exec(dataUrlPrefix)?.groups?.mimeType;
  if (!mimeType) {
    return Result.error("No mime type found.");
  }

  // Create a Blob from the Uint8Array and return the File object.
  const blob = new Blob([uint8Arr], { type: mimeType });
  /* v8 ignore stop */

  if (checkExtension && !/\.\w{2,5}$/.test(filename)) {
    return Result.error("Missing extension in the filename.");
  }

  const file = new File([blob], filename, { type: mimeType });

  return Result.ok(file);
}
