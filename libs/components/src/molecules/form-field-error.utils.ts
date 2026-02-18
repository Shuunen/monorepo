import { isObjectEmpty } from "@monorepo/utils";
import { isPlainObject } from "es-toolkit";
import type { AutoFormData } from "./auto-form.types";

type CustomErrorFn = (data: AutoFormData) => string | undefined;

export type CustomErrorAction = { message: string; type: "set-error" } | { type: "clear-error" } | { type: "none" };

/**
 * Computes the custom error message for a form field based on the current form values.
 * Returns undefined if no custom error function is provided or if the watched values are not ready.
 * @param customErrorFn - The custom error validation function from field metadata
 * @param watchedValues - The current watched form values
 * @returns The error message string or undefined
 */
export function computeCustomErrorMessage(customErrorFn: CustomErrorFn | undefined, watchedValues: AutoFormData) {
  if (!customErrorFn) {
    return undefined;
  }
  const shouldRun = isPlainObject(watchedValues) && !isObjectEmpty(watchedValues);
  return shouldRun ? customErrorFn(watchedValues) : undefined;
}

/**
 * Determines what action to take for syncing a custom error with the form context.
 * Compares the current error message with the last known error to avoid unnecessary updates.
 * @param hasCustomErrorFn - Whether a custom error function exists for this field
 * @param errorMessage - The current computed error message
 * @param lastError - The last error message that was set
 * @returns The action to take: set-error, clear-error, or none
 */
export function getCustomErrorAction(
  hasCustomErrorFn: boolean,
  errorMessage: string | undefined,
  lastError: string | undefined,
): CustomErrorAction {
  if (!hasCustomErrorFn) {
    return { type: "none" };
  }
  if (errorMessage) {
    if (lastError !== errorMessage) {
      return { message: errorMessage, type: "set-error" };
    }
    return { type: "none" };
  }
  if (lastError !== undefined) {
    return { type: "clear-error" };
  }
  return { type: "none" };
}
