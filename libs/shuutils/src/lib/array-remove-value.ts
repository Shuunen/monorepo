import { clone } from './object-clone.js'

/**
 * Remove a value from an array
 * @param array the array to remove the value from
 * @param value the value to remove
 * @returns a copy of the array without the value
 */
export function removeValueFromArray<Type>(array: readonly Type[], value: Type) {
  if (!array.includes(value)) return array
  const arrayCopy = clone(array)
  arrayCopy.splice(arrayCopy.indexOf(value), 1)
  return arrayCopy
}
