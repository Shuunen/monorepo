import { arrayUnique } from "./array-unique.js";
import { nbAscending, nbDescending } from "./constants.js";
import { clone } from "./object-clone.js";
import { objectSerialize } from "./object-serializer.js";
import { stringSum } from "./strings.js";

type GenClassTypes = boolean | null | number | string | string[] | undefined;

/**
 * Sort an array of objects by a specific property of theses objects, example :
 * ```js
 * persons.sort(byProperty('name'))
 * ```
 * @param property the property to sort by
 * @param order the order to sort, default is ascending
 * @returns the sorted array
 */
export function byProperty<Type extends Record<string, unknown>>(property: string, order: "" | "asc" | "desc" = "") {
  if (order === "") {
    return () => 0;
  }
  const sortOrder = order === "asc" ? nbAscending : nbDescending;
  return (recordA: Type, recordB: Type) => {
    const valueA = recordA[property] as number;
    const valueB = recordB[property] as number;
    if (!valueA && valueB) {
      return sortOrder;
    }
    /* v8 ignore next -- @preserve */
    if (valueA && !valueB) {
      return -sortOrder;
    }
    if (valueA === valueB) {
      return 0;
    }
    const result = valueA < valueB ? nbDescending : nbAscending;
    return result * sortOrder;
  };
}

/**
 * Check if a value is an object/record
 * @param value the value to check
 * @returns true if value is an object/record
 */
export function isRecord(value: unknown) {
  return value !== null && (typeof value === "object" || typeof value === "function") && !Array.isArray(value);
}

/**
 * Generate a unique string checksum from an object
 * @param object the object to generate checksum from
 * @param willSortKeys if true, the order of keys will be sorted alpha before checksum
 * @returns the checksum
 */
export function objectSum(object: Readonly<Record<string, unknown>>, willSortKeys = false) {
  return stringSum(objectSerialize(object, willSortKeys));
}

/**
 * Generate a list of classes from an object
 * @param object the object to generate classes from
 * @param keys optional, filter the keys to use
 * @param list optional, additional classes to add
 */
function genClassObjectKeys(object: Record<string, GenClassTypes>, keys: string[], list: GenClassTypes[]) {
  const finalKeys = keys.length === 0 ? Object.keys(object) : clone(keys);
  for (const key of finalKeys) {
    const value = object[key];
    if (typeof value === "boolean" && value) {
      list.push(key);
    } else if (typeof value === "string" && value.length > 0) {
      list.push(`${key}-${value}`);
    } else if (Array.isArray(value) && value.length > 0) {
      list.push(`has-${key}`);
    }
  }
}

/**
 * Auto-magically generate styling classes from an object
 * @param object every key-value will generate a class, ex: enabled: true, disabled: false, size: 'large'
 * @param keys optional, filter the keys to use
 * @param cls optional, additional classes to add, ex: "add-me"
 * @returns ready to use string class list, ex: "enabled size-large add-me"
 */
export function genClass(object: GenClassTypes | GenClassTypes[] | Record<string, GenClassTypes>, keys: string[] = [], cls: GenClassTypes[] = []) {
  const list = clone(cls);
  if (object === null || object === undefined) {
    list.unshift("");
  } else if (typeof object !== "object") {
    list.unshift(...String(object).split(" "));
  } else if (Array.isArray(object)) {
    list.unshift(...object.filter(Boolean).join(" ").split(" "));
  } else {
    genClassObjectKeys(object, keys, list);
  }
  return arrayUnique(list.map(String)).join(" ").trim().replaceAll(/\s+/gu, " ");
}
