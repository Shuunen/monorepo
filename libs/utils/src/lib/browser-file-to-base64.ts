import { invariant } from "es-toolkit";
import { Result, type ResultType } from "./result.js";

/**
 * Convert a `File` instance to base64.
 * @param file the file instance
 * @returns the base64 string
 */
export function fileToBase64(file: File): Promise<ResultType<string, string>> {
  return new Promise(resolve => {
    const reader = new FileReader();

    // oxlint-disable-next-line prefer-add-event-listener
    reader.onload = () => {
      invariant(reader.result !== null, "reader.result is null");
      invariant(typeof reader.result === "string", "reader.result must be a string");
      return resolve(Result.ok(reader.result));
    };

    /* v8 ignore start */
    // oxlint-disable-next-line prefer-add-event-listener
    reader.onerror = () => resolve(Result.error("Conversion to base64 failed"));

    reader.readAsDataURL(file);
  });
}
