import { clone } from './object-clone.js';
/**
 * Remove a value from an array
 * @param array the array to remove the value from
 * @param value the value to remove
 * @returns a copy of the array without the value
 */ export function removeValueFromArray(array, value) {
    if (!array.includes(value)) return array;
    const arrayCopy = clone(array);
    arrayCopy.splice(arrayCopy.indexOf(value), 1);
    return arrayCopy;
}

//# sourceMappingURL=array-remove-value.js.map