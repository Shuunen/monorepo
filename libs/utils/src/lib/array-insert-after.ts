import { nbAfter, nbNoIndex } from "./constants.js";
import { clone } from "./object-clone.js";

/**
 * Add a value to an array if it does not already exist
 * @param array the array to add the value to
 * @param item the value to add
 * @param value the value to add
 * @returns the array with the value added (if it did not already exist)
 */
export function insertValueAfterItem<Type>(array: readonly Type[], item: Type, value: Type) {
  const index = array.indexOf(item);
  if (index === nbNoIndex) {
    return array;
  }
  const arrayCopy = clone(array);
  const start = Math.min(index + nbAfter, arrayCopy.length);
  arrayCopy.splice(start, 0, value);
  return arrayCopy;
}
