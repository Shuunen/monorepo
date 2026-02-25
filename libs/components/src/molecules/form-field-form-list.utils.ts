import { isEmptyObject, isPlainObject } from "es-toolkit";
import type { AutoFormData } from "./auto-form.types";

/**
 * Check if a form data seems filled
 * @param data the data to check
 * @returns true if it seems filled
 */
export function isSubformFilled(data: AutoFormData): boolean {
  return Object.values(data).some(value => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    if (isEmptyObject(value)) {
      return false;
    }
    // @ts-expect-error type issue
    // oxlint-disable-next-line unicorn/no-null
    return ![undefined, null, "", false].includes(value);
  });
}

export function nbFilledItems(items?: unknown) {
  if (items === undefined) {
    return 0;
  }
  if (!Array.isArray(items)) {
    return 0;
  }
  return items.filter(item => isPlainObject(item) && isSubformFilled(item)).length;
}
